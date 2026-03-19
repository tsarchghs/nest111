create extension if not exists "pgcrypto";

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text not null default 'Hospitality',
  primary_color text not null default '#257bf4',
  currency_code text not null default 'USD',
  timezone text not null default 'Europe/Warsaw',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  avatar_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  manager_name text not null default '',
  city text not null default '',
  status text not null default 'active',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, code)
);

create table if not exists workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  role text not null check (role in ('owner', 'erp', 'admin', 'pos')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists bank_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  bank_name text not null,
  account_name text not null,
  account_number_last4 text not null,
  currency_code text not null default 'USD',
  status text not null default 'active',
  iban text not null default '',
  swift_code text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references workspaces(id) on delete cascade,
  legal_name text not null,
  trading_name text not null,
  email text not null,
  phone text not null default '',
  tax_rate numeric(6,4) not null default 0.08,
  invoice_prefix text not null default 'INV',
  pos_service_charge numeric(6,4) not null default 0,
  address text not null default '',
  locale text not null default 'en-US',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists sales_invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  invoice_number text not null unique,
  customer_name text not null,
  customer_email text not null default '',
  status text not null default 'draft',
  due_date date,
  notes text not null default '',
  subtotal numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sales_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references sales_invoices(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null default 0,
  line_total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table categories add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
alter table products add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
alter table products add column if not exists sku text not null default '';
alter table products add column if not exists cost_price numeric(10, 2) not null default 0;
alter table products add column if not exists stock_quantity integer not null default 0;
alter table products add column if not exists reorder_level integer not null default 5;
alter table products add column if not exists status text not null default 'active';
alter table tables add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
alter table tables add column if not exists branch_id uuid references branches(id) on delete set null;
alter table tables add column if not exists zone text not null default 'Main Floor';
alter table tables add column if not exists display_order integer not null default 0;
alter table orders add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
alter table orders add column if not exists branch_id uuid references branches(id) on delete set null;
alter table payments add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
alter table payments add column if not exists branch_id uuid references branches(id) on delete set null;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from workspace_memberships wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.active = true
  );
$$;

create or replace function public.has_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from workspace_memberships wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.active = true
      and wm.role = any(allowed_roles)
  );
$$;

alter table workspaces enable row level security;
alter table user_profiles enable row level security;
alter table branches enable row level security;
alter table workspace_memberships enable row level security;
alter table bank_accounts enable row level security;
alter table business_settings enable row level security;
alter table sales_invoices enable row level security;
alter table sales_invoice_items enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table tables enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;

drop policy if exists "Profiles can view self" on user_profiles;
create policy "Profiles can view self"
  on user_profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Profiles can update self" on user_profiles;
create policy "Profiles can update self"
  on user_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Memberships visible to current user" on workspace_memberships;
create policy "Memberships visible to current user"
  on workspace_memberships for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Workspace members can view workspaces" on workspaces;
create policy "Workspace members can view workspaces"
  on workspaces for select
  to authenticated
  using (public.is_workspace_member(id));

drop policy if exists "Workspace members can view branches" on branches;
create policy "Workspace members can view branches"
  on branches for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Admins can manage branches" on branches;
create policy "Admins can manage branches"
  on branches for all
  to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

drop policy if exists "Workspace members can view bank accounts" on bank_accounts;
create policy "Workspace members can view bank accounts"
  on bank_accounts for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Admins can manage bank accounts" on bank_accounts;
create policy "Admins can manage bank accounts"
  on bank_accounts for all
  to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

drop policy if exists "Workspace members can view business settings" on business_settings;
create policy "Workspace members can view business settings"
  on business_settings for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Admins can manage business settings" on business_settings;
create policy "Admins can manage business settings"
  on business_settings for all
  to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

drop policy if exists "Workspace members can view categories" on categories;
create policy "Workspace members can view categories"
  on categories for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "ERP can manage categories" on categories;
create policy "ERP can manage categories"
  on categories for all
  to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'erp']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'erp']));

drop policy if exists "Workspace members can view products" on products;
create policy "Workspace members can view products"
  on products for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "ERP can manage products" on products;
create policy "ERP can manage products"
  on products for all
  to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'erp']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'erp']));

drop policy if exists "Workspace members can view tables" on tables;
create policy "Workspace members can view tables"
  on tables for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "POS can manage tables" on tables;
create policy "POS can manage tables"
  on tables for all
  to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'pos']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'pos']));

drop policy if exists "Workspace members can view orders" on orders;
create policy "Workspace members can view orders"
  on orders for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "POS can manage orders" on orders;
create policy "POS can manage orders"
  on orders for all
  to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'pos']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'pos']));

drop policy if exists "Workspace members can view payments" on payments;
create policy "Workspace members can view payments"
  on payments for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "POS can manage payments" on payments;
create policy "POS can manage payments"
  on payments for all
  to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'pos']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'pos']));

drop policy if exists "Workspace members can view sales invoices" on sales_invoices;
create policy "Workspace members can view sales invoices"
  on sales_invoices for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "ERP can manage sales invoices" on sales_invoices;
create policy "ERP can manage sales invoices"
  on sales_invoices for all
  to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'erp']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'erp']));

drop policy if exists "Workspace members can view sales invoice items" on sales_invoice_items;
create policy "Workspace members can view sales invoice items"
  on sales_invoice_items for select
  to authenticated
  using (
    exists (
      select 1
      from sales_invoices si
      where si.id = sales_invoice_items.invoice_id
        and public.is_workspace_member(si.workspace_id)
    )
  );

drop policy if exists "ERP can manage sales invoice items" on sales_invoice_items;
create policy "ERP can manage sales invoice items"
  on sales_invoice_items for all
  to authenticated
  using (
    exists (
      select 1
      from sales_invoices si
      where si.id = sales_invoice_items.invoice_id
        and public.has_workspace_role(si.workspace_id, array['owner', 'erp'])
    )
  )
  with check (
    exists (
      select 1
      from sales_invoices si
      where si.id = sales_invoice_items.invoice_id
        and public.has_workspace_role(si.workspace_id, array['owner', 'erp'])
    )
  );

insert into workspaces (name, slug, industry, primary_color, currency_code, timezone)
values ('Nexus Cafe Group', 'nexus-cafe', 'Hospitality', '#257bf4', 'USD', 'Europe/Warsaw')
on conflict (slug) do update
set
  name = excluded.name,
  updated_at = now();

with workspace as (
  select id from workspaces where slug = 'nexus-cafe'
)
insert into branches (workspace_id, code, name, manager_name, city, status, phone)
select workspace.id, branch.code, branch.name, branch.manager_name, branch.city, branch.status, branch.phone
from workspace
cross join (
  values
    ('HQ', 'Downtown Flagship', 'Naomi Kerr', 'Warsaw', 'active', '+48 22 100 1000'),
    ('OLD', 'Old Town Cafe', 'Lucas Ford', 'Warsaw', 'active', '+48 22 100 2000'),
    ('RIV', 'Riverside Kiosk', 'Mina Shah', 'Krakow', 'maintenance', '+48 22 100 3000')
) as branch(code, name, manager_name, city, status, phone)
on conflict (workspace_id, code) do update
set
  name = excluded.name,
  manager_name = excluded.manager_name,
  city = excluded.city,
  status = excluded.status,
  phone = excluded.phone,
  updated_at = now();

with workspace as (
  select id from workspaces where slug = 'nexus-cafe'
)
insert into business_settings (
  workspace_id,
  legal_name,
  trading_name,
  email,
  phone,
  tax_rate,
  invoice_prefix,
  pos_service_charge,
  address,
  locale
)
select
  workspace.id,
  'Nexus Cafe Group Sp. z o.o.',
  'Nexus Cafe',
  'finance@nexuscafe.local',
  '+48 22 100 9999',
  0.08,
  'INV',
  0.10,
  'Marszalkowska 10, Warsaw',
  'en-US'
from workspace
on conflict (workspace_id) do update
set
  trading_name = excluded.trading_name,
  email = excluded.email,
  phone = excluded.phone,
  tax_rate = excluded.tax_rate,
  invoice_prefix = excluded.invoice_prefix,
  pos_service_charge = excluded.pos_service_charge,
  address = excluded.address,
  locale = excluded.locale,
  updated_at = now();

with workspace as (
  select id from workspaces where slug = 'nexus-cafe'
),
branch as (
  select id, workspace_id from branches where code = 'HQ' and workspace_id = (select id from workspace)
)
insert into bank_accounts (
  workspace_id,
  branch_id,
  bank_name,
  account_name,
  account_number_last4,
  currency_code,
  status,
  iban,
  swift_code
)
select
  workspace.id,
  branch.id,
  account.bank_name,
  account.account_name,
  account.account_number_last4,
  account.currency_code,
  account.status,
  account.iban,
  account.swift_code
from workspace
cross join branch
cross join (
  values
    ('Santander', 'Operating Account', '4488', 'USD', 'active', 'PL10109010140000071219812874', 'WBKPPLPP'),
    ('mBank', 'Payroll Reserve', '2214', 'PLN', 'active', 'PL58114020040000300201355387', 'BREXPLPW'),
    ('Wise', 'USD Clearing', '9032', 'USD', 'pending', 'GB12CLRB04066212345678', 'TRWIGB2L')
) as account(bank_name, account_name, account_number_last4, currency_code, status, iban, swift_code)
on conflict do nothing;

with workspace as (
  select id from workspaces where slug = 'nexus-cafe'
)
update categories
set workspace_id = workspace.id
from workspace
where categories.workspace_id is null;

with workspace as (
  select id from workspaces where slug = 'nexus-cafe'
)
update products
set
  workspace_id = workspace.id,
  sku = case when coalesce(products.sku, '') = '' then upper(replace(products.name, ' ', '-')) else products.sku end,
  cost_price = case when products.cost_price = 0 then round((products.price * 0.42)::numeric, 2) else products.cost_price end,
  stock_quantity = case when products.stock_quantity = 0 then 24 else products.stock_quantity end,
  reorder_level = case when products.reorder_level = 5 then 8 else products.reorder_level end,
  status = coalesce(nullif(products.status, ''), 'active')
from workspace
where products.workspace_id is null;

with workspace as (
  select id from workspaces where slug = 'nexus-cafe'
),
branch as (
  select id from branches where code = 'HQ' and workspace_id = (select id from workspace)
)
update tables
set
  workspace_id = workspace.id,
  branch_id = branch.id,
  display_order = coalesce(nullif(tables.table_number, '')::integer, 0)
from workspace, branch
where tables.workspace_id is null;

with workspace as (
  select id from workspaces where slug = 'nexus-cafe'
),
branch as (
  select id from branches where code = 'HQ' and workspace_id = (select id from workspace)
)
update orders
set
  workspace_id = workspace.id,
  branch_id = branch.id
from workspace, branch
where orders.workspace_id is null;

with workspace as (
  select id from workspaces where slug = 'nexus-cafe'
),
branch as (
  select id from branches where code = 'HQ' and workspace_id = (select id from workspace)
)
update payments
set
  workspace_id = workspace.id,
  branch_id = branch.id
from workspace, branch
where payments.workspace_id is null;

with workspace as (
  select id from workspaces where slug = 'nexus-cafe'
),
branch as (
  select id from branches where code = 'HQ' and workspace_id = (select id from workspace)
)
insert into sales_invoices (
  workspace_id,
  branch_id,
  invoice_number,
  customer_name,
  customer_email,
  status,
  due_date,
  notes,
  subtotal,
  tax_amount,
  total_amount,
  created_at,
  updated_at
)
select
  workspace.id,
  branch.id,
  invoice.invoice_number,
  invoice.customer_name,
  invoice.customer_email,
  invoice.status,
  invoice.due_date,
  invoice.notes,
  invoice.subtotal,
  invoice.tax_amount,
  invoice.total_amount,
  invoice.created_at,
  invoice.created_at
from workspace
cross join branch
cross join (
  values
    ('INV-2026-0001', 'Acme Hospitality', 'ops@acme.local', 'paid', current_date - 15, 'Monthly pantry refill', 480.00, 38.40, 518.40, now() - interval '15 day'),
    ('INV-2026-0002', 'Northwind Events', 'bookings@northwind.local', 'sent', current_date + 7, 'Catering prepayment', 320.00, 25.60, 345.60, now() - interval '9 day'),
    ('INV-2026-0003', 'Harbor Studios', 'finance@harbor.local', 'overdue', current_date - 3, 'Beans and pastry order', 210.00, 16.80, 226.80, now() - interval '4 day')
) as invoice(invoice_number, customer_name, customer_email, status, due_date, notes, subtotal, tax_amount, total_amount, created_at)
on conflict (invoice_number) do nothing;

with invoice_source as (
  select id, invoice_number
  from sales_invoices
  where invoice_number in ('INV-2026-0001', 'INV-2026-0002', 'INV-2026-0003')
),
product_source as (
  select id, name, price
  from products
  where workspace_id = (select id from workspaces where slug = 'nexus-cafe')
  order by name
  limit 3
)
insert into sales_invoice_items (invoice_id, product_id, description, quantity, unit_price, line_total)
select
  invoice_source.id,
  product_source.id,
  product_source.name,
  case invoice_source.invoice_number
    when 'INV-2026-0001' then 12
    when 'INV-2026-0002' then 8
    else 5
  end,
  product_source.price,
  round(product_source.price * case invoice_source.invoice_number
    when 'INV-2026-0001' then 12
    when 'INV-2026-0002' then 8
    else 5
  end, 2)
from invoice_source
cross join lateral (
  select *
  from product_source
  limit 1
) as product_source
where not exists (
  select 1 from sales_invoice_items sii where sii.invoice_id = invoice_source.id
);
