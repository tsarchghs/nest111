alter table workspaces add column if not exists brand_name text not null default 'Gambit LLC';
alter table workspaces add column if not exists brand_tagline text not null default 'Operate every branch with precision.';
alter table workspaces add column if not exists accent_color text not null default '#81a1c1';
alter table workspaces add column if not exists surface_color text not null default '#2e3440';
alter table workspaces add column if not exists login_title text not null default 'Every branch. Every table. One gambit ahead.';
alter table workspaces add column if not exists login_message text not null default 'Gambit unifies POS, ERP, administration, and owner controls inside one branded workspace.';
alter table workspaces add column if not exists hero_pattern text not null default 'nordic';

update workspaces
set
  name = 'Gambit LLC',
  slug = 'gambit-llc',
  primary_color = '#a3be8c',
  accent_color = '#81a1c1',
  surface_color = '#2e3440',
  brand_name = 'Gambit LLC',
  brand_tagline = 'Operate every branch with precision.',
  login_title = 'Every branch. Every table. One gambit ahead.',
  login_message = 'Gambit unifies POS, ERP, administration, and owner controls inside one branded workspace.',
  hero_pattern = 'nordic',
  updated_at = now()
where slug in ('nexus-cafe', 'gambit-llc');

update business_settings
set
  legal_name = 'Gambit LLC',
  trading_name = 'Gambit',
  email = 'finance@gambit.local',
  updated_at = now()
where workspace_id in (
  select id
  from workspaces
  where slug = 'gambit-llc'
);
