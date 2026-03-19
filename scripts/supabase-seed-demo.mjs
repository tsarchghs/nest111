import { createClient } from '@supabase/supabase-js';

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const users = [
  {
    email: 'owner@nexus.local',
    password: 'Passw0rd!',
    fullName: 'Avery Stone',
    role: 'owner',
  },
  {
    email: 'erp@nexus.local',
    password: 'Passw0rd!',
    fullName: 'Jordan Price',
    role: 'erp',
  },
  {
    email: 'admin@nexus.local',
    password: 'Passw0rd!',
    fullName: 'Morgan Hale',
    role: 'admin',
  },
  {
    email: 'pos@nexus.local',
    password: 'Passw0rd!',
    fullName: 'Riley Brooks',
    role: 'pos',
  },
];

const { data: workspace, error: workspaceError } = await supabase
  .from('workspaces')
  .select('id')
  .eq('slug', 'nexus-cafe')
  .maybeSingle();

if (workspaceError || !workspace) {
  throw new Error(
    `Workspace nexus-cafe must exist before seeding users: ${workspaceError?.message ?? 'not found'}`,
  );
}

const { data: branch, error: branchError } = await supabase
  .from('branches')
  .select('id')
  .eq('workspace_id', workspace.id)
  .eq('code', 'HQ')
  .maybeSingle();

if (branchError || !branch) {
  throw new Error(
    `Branch HQ must exist before seeding users: ${branchError?.message ?? 'not found'}`,
  );
}

const listUsers = async () => {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });

  if (error) {
    throw error;
  }

  return data.users;
};

for (const user of users) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      full_name: user.fullName,
    },
  });

  if (createError && !createError.message.toLowerCase().includes('already been registered')) {
    throw createError;
  }

  const userId =
    created?.user?.id ??
    (await listUsers()).find((entry) => entry.email === user.email)?.id;

  if (!userId) {
    throw new Error(`Unable to resolve user id for ${user.email}`);
  }

  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      id: userId,
      email: user.email,
      full_name: user.fullName,
    },
    { onConflict: 'id' },
  );

  if (profileError) {
    throw profileError;
  }

  const { error: membershipError } = await supabase
    .from('workspace_memberships')
    .upsert(
      {
        workspace_id: workspace.id,
        user_id: userId,
        branch_id: branch.id,
        role: user.role,
        active: true,
      },
      { onConflict: 'workspace_id,user_id' },
    );

  if (membershipError) {
    throw membershipError;
  }
}

console.log('Demo users are ready.');
