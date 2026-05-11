create table if not exists contact_messages (
  id          uuid        default gen_random_uuid() primary key,
  nombre      text        not null,
  email       text        not null,
  asunto      text        not null,
  mensaje     text        not null,
  created_at  timestamptz default now()
);

alter table contact_messages enable row level security;
-- Solo el rol service_role puede leer (panel admin)
create policy "service only" on contact_messages for all using (false);
