create extension if not exists "pgcrypto";

create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome text,
  telefone text,
  papel text not null default 'cliente' check (papel in ('cliente', 'admin')),
  criado_em timestamptz not null default now()
);

create or replace function eh_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and papel = 'admin');
$$;

create or replace function criar_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfis (id, email, nome) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome', ''));
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function criar_perfil();

create table if not exists modelos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique,
  categoria text not null check (categoria in ('copos', 'canecas', 'tacas', 'garrafas')),
  descricao text default '',
  fotos text[] not null default '{}',
  altura_cm numeric,
  diametro_cm numeric,
  capacidade_ml integer,
  material text not null check (material in ('vidro', 'ceramica', 'inox')),
  preco_base numeric(10,2) not null default 0,
  prazo_producao_dias integer not null default 5,
  mockup_frente text,
  mockup_verso text,
  forma text not null default 'caneca',
  area_pintavel jsonb not null default '{"x":0.2,"y":0.25,"w":0.6,"h":0.5}',
  disponivel boolean not null default true,
  estoque integer not null default 0,
  estoque_minimo integer not null default 5,
  mais_vendido boolean not null default false,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists artes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tema text not null,
  descricao text default '',
  fotos text[] not null default '{}',
  desenho jsonb,
  acrescimo numeric(10,2) not null default 0,
  modelos_aceitos uuid[] not null default '{}',
  ocasioes text[] not null default '{}',
  personalizavel jsonb not null default '{"nome":true,"frase":true,"data":true,"cor":true}',
  ativo boolean not null default true,
  mais_vendida boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists elementos_editor (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  grupo text not null default 'flores',
  imagem text,
  svg text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists solicitacoes_analise (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default upper(substr(md5(random()::text), 1, 6)),
  cliente_id uuid references auth.users(id) on delete set null,
  cliente_nome text not null,
  cliente_email text,
  cliente_whatsapp text,
  modelo_id uuid references modelos(id) on delete set null,
  mockup_frente text,
  mockup_verso text,
  desenho jsonb,
  referencias text[] not null default '{}',
  observacoes text default '',
  quantidade integer not null default 1 check (quantidade > 0),
  data_desejada date,
  status text not null default 'em_analise'
    check (status in ('em_analise', 'aprovado', 'ajuste_sugerido', 'recusado', 'convertido')),
  preco_unitario numeric(10,2),
  prazo_dias integer,
  comentario_artesao text,
  imagem_ajuste text,
  motivo_recusa text,
  historico jsonb not null default '[]',
  pedido_id uuid,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create sequence if not exists serie_peca start 1;

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  numero serial unique,
  cliente_id uuid references auth.users(id) on delete set null,
  cliente_nome text not null,
  cliente_email text,
  cliente_whatsapp text,
  cep text,
  endereco jsonb,
  subtotal numeric(10,2) not null default 0,
  desconto numeric(10,2) not null default 0,
  frete numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  pagamento text check (pagamento in ('pix', 'cartao')),
  pagamento_status text not null default 'pendente' check (pagamento_status in ('pendente', 'pago', 'cancelado')),
  prazo_producao_dias integer,
  prazo_entrega_dias integer,
  etapa text not null default 'novo'
    check (etapa in ('novo', 'em_pintura', 'secagem', 'embalagem', 'enviado')),
  foto_pronta text,
  foto_aprovada_cliente boolean,
  autoriza_galeria boolean not null default false,
  codigo_rastreio text,
  origem text not null default 'loja' check (origem in ('loja', 'analise', 'kit', 'corporativo')),
  criado_em timestamptz not null default now()
);

create table if not exists itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  modelo_id uuid references modelos(id) on delete set null,
  arte_id uuid references artes(id) on delete set null,
  solicitacao_id uuid references solicitacoes_analise(id) on delete set null,
  kit_id uuid,
  descricao text not null,
  personalizacao jsonb not null default '{}',
  mockup text,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null,
  numeros_serie integer[] not null default '{}'
);

create or replace function gerar_numeros_serie() returns trigger
language plpgsql as $$
begin
  if coalesce(array_length(new.numeros_serie, 1), 0) = 0 then
    select array_agg(nextval('serie_peca')::integer) into new.numeros_serie
    from generate_series(1, new.quantidade);
  end if;
  return new;
end;
$$;

drop trigger if exists serie_itens on itens_pedido;
create trigger serie_itens before insert on itens_pedido
  for each row execute function gerar_numeros_serie();

create table if not exists kits (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text default '',
  composicao jsonb not null default '[]',
  desconto_percentual numeric(5,2) not null default 10,
  ativo boolean not null default true
);

create table if not exists galeria_clientes (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete set null,
  foto text not null,
  legenda text default '',
  cliente_nome text,
  autorizado boolean not null default false,
  publicado boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists pedidos_corporativos (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  cnpj text,
  contato_nome text not null,
  contato_email text,
  contato_whatsapp text,
  modelo_id uuid references modelos(id) on delete set null,
  quantidade integer not null,
  logo text,
  data_desejada date,
  observacoes text default '',
  status text not null default 'novo' check (status in ('novo', 'orcamento_enviado', 'fechado', 'perdido')),
  criado_em timestamptz not null default now()
);

create table if not exists datas_comemorativas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  dia integer not null check (dia between 1 and 31),
  mes integer not null check (mes between 1 and 12),
  descricao text default '',
  artes_sugeridas uuid[] not null default '{}'
);

create table if not exists configuracoes (
  chave text primary key,
  valor jsonb not null,
  atualizado_em timestamptz not null default now()
);

insert into configuracoes (chave, valor) values
  ('loja', '{"nome":"Ateliê Flor de Vidro","whatsapp":"5511999999999","email":"","instagram":"","cidade":"","cep_origem":""}'),
  ('frete', '{"gratis_acima":350,"faixas":[{"regiao":"Mesma cidade","prefixos":[],"valor":15,"dias":2},{"regiao":"Sudeste","prefixos":["0","1","2","3"],"valor":25,"dias":5},{"regiao":"Sul","prefixos":["8","9"],"valor":32,"dias":7},{"regiao":"Centro-Oeste","prefixos":["7"],"valor":38,"dias":8},{"regiao":"Nordeste","prefixos":["4","5","6"],"valor":42,"dias":10}]}'),
  ('descontos', '{"faixas":[{"minimo":6,"percentual":5},{"minimo":12,"percentual":10},{"minimo":30,"percentual":15},{"minimo":50,"percentual":20}]}'),
  ('textos', '{"sobre":"","aviso_artesanal":"Por ser pintura à mão, podem existir pequenas variações. Isso torna sua peça única.","trocas":""}'),
  ('corporativo', '{"quantidade_minima":20}')
on conflict (chave) do nothing;

alter table perfis enable row level security;
alter table modelos enable row level security;
alter table artes enable row level security;
alter table elementos_editor enable row level security;
alter table solicitacoes_analise enable row level security;
alter table pedidos enable row level security;
alter table itens_pedido enable row level security;
alter table kits enable row level security;
alter table galeria_clientes enable row level security;
alter table pedidos_corporativos enable row level security;
alter table datas_comemorativas enable row level security;
alter table configuracoes enable row level security;

create policy "perfil proprio" on perfis for select using (id = auth.uid() or eh_admin());
create policy "perfil editar" on perfis for update using (id = auth.uid() or eh_admin())
  with check (eh_admin() or (id = auth.uid() and papel = 'cliente'));

create policy "modelos leitura" on modelos for select using (disponivel or eh_admin());
create policy "modelos admin" on modelos for all using (eh_admin()) with check (eh_admin());

create policy "artes leitura" on artes for select using (ativo or eh_admin());
create policy "artes admin" on artes for all using (eh_admin()) with check (eh_admin());

create policy "elementos leitura" on elementos_editor for select using (ativo or eh_admin());
create policy "elementos admin" on elementos_editor for all using (eh_admin()) with check (eh_admin());

create policy "kits leitura" on kits for select using (ativo or eh_admin());
create policy "kits admin" on kits for all using (eh_admin()) with check (eh_admin());

create policy "datas leitura" on datas_comemorativas for select using (true);
create policy "datas admin" on datas_comemorativas for all using (eh_admin()) with check (eh_admin());

create policy "config leitura" on configuracoes for select using (true);
create policy "config admin" on configuracoes for all using (eh_admin()) with check (eh_admin());

create policy "galeria leitura" on galeria_clientes for select using ((publicado and autorizado) or eh_admin());
create policy "galeria admin" on galeria_clientes for all using (eh_admin()) with check (eh_admin());

create policy "solicitacao criar" on solicitacoes_analise for insert
  with check (cliente_id = auth.uid() and status = 'em_analise' and preco_unitario is null and prazo_dias is null);
create policy "solicitacao ver" on solicitacoes_analise for select using (cliente_id = auth.uid() or eh_admin());
create policy "solicitacao admin" on solicitacoes_analise for update using (eh_admin()) with check (eh_admin());
create policy "pedido ver" on pedidos for select using (cliente_id = auth.uid() or eh_admin());
create policy "pedido admin" on pedidos for all using (eh_admin()) with check (eh_admin());

create policy "itens ver" on itens_pedido for select
  using (eh_admin() or exists (select 1 from pedidos p where p.id = pedido_id and p.cliente_id = auth.uid()));
create policy "itens admin" on itens_pedido for all using (eh_admin()) with check (eh_admin());

create or replace function desconto_quantidade(qtd integer) returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce(max((f->>'percentual')::numeric), 0)
  from configuracoes c, jsonb_array_elements(c.valor->'faixas') f
  where c.chave = 'descontos' and qtd >= (f->>'minimo')::integer;
$$;

create or replace function calcular_frete(p_cep text, p_subtotal numeric)
returns table (valor numeric, dias integer, regiao text)
language plpgsql stable security definer set search_path = public as $$
declare
  cfg jsonb;
  faixa jsonb;
  pref text;
  cep text := regexp_replace(coalesce(p_cep, ''), '\D', '', 'g');
  gratis boolean;
begin
  select c.valor into cfg from configuracoes c where c.chave = 'frete';
  gratis := p_subtotal >= coalesce((cfg->>'gratis_acima')::numeric, 1e12);
  for faixa in select * from jsonb_array_elements(cfg->'faixas') loop
    for pref in select jsonb_array_elements_text(faixa->'prefixos') loop
      if pref <> '' and cep like pref || '%' then
        valor := case when gratis then 0 else (faixa->>'valor')::numeric end;
        dias := (faixa->>'dias')::integer;
        regiao := faixa->>'regiao';
        return next;
        return;
      end if;
    end loop;
  end loop;
  valor := case when gratis then 0 else 55 end;
  dias := 12;
  regiao := 'Norte e demais';
  return next;
end;
$$;

create or replace function criar_pedido(p_itens jsonb, p_dados jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  it jsonb;
  m modelos;
  a artes;
  s solicitacoes_analise;
  k kits;
  preco numeric;
  prazo integer := 0;
  qtd_total integer := 0;
  v_subtotal numeric := 0;
  v_desconto numeric := 0;
  v_frete record;
  v_pedido uuid;
  v_origem text := 'loja';
  linhas jsonb := '[]';
begin
  if auth.uid() is null then raise exception 'Entre na sua conta para finalizar.'; end if;
  for it in select * from jsonb_array_elements(p_itens) loop
    if (it->>'quantidade')::integer < 1 then raise exception 'Quantidade inválida.'; end if;
    select * into m from modelos where id = (it->>'modelo_id')::uuid and disponivel;
    if not found then raise exception 'Modelo indisponível.'; end if;
    if nullif(it->>'solicitacao_id', '') is not null then
      select * into s from solicitacoes_analise
        where id = (it->>'solicitacao_id')::uuid and cliente_id = auth.uid() and status = 'aprovado';
      if not found then raise exception 'Solicitação não aprovada.'; end if;
      preco := s.preco_unitario;
      prazo := greatest(prazo, coalesce(s.prazo_dias, m.prazo_producao_dias));
      v_origem := 'analise';
    else
      preco := m.preco_base;
      prazo := greatest(prazo, m.prazo_producao_dias);
      if nullif(it->>'arte_id', '') is not null then
        select * into a from artes where id = (it->>'arte_id')::uuid and ativo;
        if not found then raise exception 'Arte indisponível.'; end if;
        preco := preco + a.acrescimo;
      end if;
      if nullif(it->>'kit_id', '') is not null then
        select * into k from kits where id = (it->>'kit_id')::uuid and ativo;
        if found then
          preco := round(preco * (1 - k.desconto_percentual / 100), 2);
          v_origem := 'kit';
        end if;
      end if;
    end if;
    qtd_total := qtd_total + (it->>'quantidade')::integer;
    v_subtotal := v_subtotal + preco * (it->>'quantidade')::integer;
    linhas := linhas || jsonb_build_array(it || jsonb_build_object('preco', preco));
  end loop;

  v_desconto := round(v_subtotal * desconto_quantidade(qtd_total) / 100, 2);
  select * into v_frete from calcular_frete(p_dados->>'cep', v_subtotal - v_desconto);

  insert into pedidos (cliente_id, cliente_nome, cliente_email, cliente_whatsapp, cep, endereco,
    subtotal, desconto, frete, total, pagamento, prazo_producao_dias, prazo_entrega_dias, origem, autoriza_galeria)
  values (auth.uid(), p_dados->>'nome', p_dados->>'email', p_dados->>'whatsapp', p_dados->>'cep', p_dados->'endereco',
    v_subtotal, v_desconto, v_frete.valor, v_subtotal - v_desconto + v_frete.valor, p_dados->>'pagamento',
    prazo, v_frete.dias, v_origem, coalesce((p_dados->>'autoriza_galeria')::boolean, false))
  returning id into v_pedido;

  for it in select * from jsonb_array_elements(linhas) loop
    insert into itens_pedido (pedido_id, modelo_id, arte_id, solicitacao_id, kit_id, descricao, personalizacao, mockup, quantidade, preco_unitario)
    values (v_pedido, (it->>'modelo_id')::uuid, nullif(it->>'arte_id', '')::uuid, nullif(it->>'solicitacao_id', '')::uuid,
      nullif(it->>'kit_id', '')::uuid, it->>'descricao', coalesce(it->'personalizacao', '{}'), it->>'mockup',
      (it->>'quantidade')::integer, (it->>'preco')::numeric);
    if nullif(it->>'solicitacao_id', '') is not null then
      update solicitacoes_analise set status = 'convertido', pedido_id = v_pedido, atualizado_em = now()
        where id = (it->>'solicitacao_id')::uuid;
    end if;
    update modelos set estoque = greatest(estoque - (it->>'quantidade')::integer, 0) where id = (it->>'modelo_id')::uuid;
  end loop;
  return v_pedido;
end;
$$;

create or replace function reenviar_solicitacao(p_id uuid, p_dados jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  update solicitacoes_analise set
    mockup_frente = coalesce(p_dados->>'mockup_frente', mockup_frente),
    mockup_verso = coalesce(p_dados->>'mockup_verso', mockup_verso),
    desenho = coalesce(p_dados->'desenho', desenho),
    observacoes = coalesce(p_dados->>'observacoes', observacoes),
    status = 'em_analise',
    historico = historico || jsonb_build_array(jsonb_build_object('status', 'em_analise', 'em', now(), 'texto', 'Cliente reenviou com ajustes')),
    atualizado_em = now()
  where id = p_id and cliente_id = auth.uid() and status = 'ajuste_sugerido';
  if not found then raise exception 'Esta solicitação não pode ser reenviada.'; end if;
end;
$$;

create or replace function responder_foto_pedido(p_id uuid, p_aprovada boolean, p_autoriza boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  update pedidos set foto_aprovada_cliente = p_aprovada, autoriza_galeria = p_autoriza
  where id = p_id and cliente_id = auth.uid() and foto_pronta is not null;
  if not found then raise exception 'Pedido não encontrado.'; end if;
end;
$$;

create policy "corporativo criar" on pedidos_corporativos for insert with check (status = 'novo');
create policy "corporativo admin" on pedidos_corporativos for all using (eh_admin()) with check (eh_admin());

insert into storage.buckets (id, name, public) values ('imagens', 'imagens', true)
  on conflict (id) do nothing;

create policy "imagens leitura" on storage.objects for select using (bucket_id = 'imagens');
create policy "imagens envio" on storage.objects for insert
  with check (bucket_id = 'imagens' and (eh_admin() or (auth.role() = 'authenticated' and (storage.foldername(name))[1] = 'clientes')));
create policy "imagens corporativo" on storage.objects for insert
  with check (bucket_id = 'imagens' and (storage.foldername(name))[1] = 'corporativo');
create policy "imagens admin" on storage.objects for all using (bucket_id = 'imagens' and eh_admin());
