import { useEffect, useState } from 'react';
import { api, type Branch } from '../api/api';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);

  const load = async () => {
    const response = await api.getBranches();
    setBranches(response.branches);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-primary/80">Administration</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Branches Management</h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {branches.map((branch) => (
          <div key={branch.id} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  {branch.code}
                </p>
                <h2 className="mt-2 text-2xl font-black">{branch.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{branch.city}</p>
              </div>
              <select
                value={branch.status}
                onChange={async (event) => {
                  await api.updateBranch(branch.id, {
                    status: event.target.value,
                    manager_name: branch.manager_name,
                  });
                  await load();
                }}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Manager</span>
              <input
                value={branch.manager_name}
                onChange={(event) => {
                  setBranches((current) =>
                    current.map((entry) =>
                      entry.id === branch.id
                        ? { ...entry, manager_name: event.target.value }
                        : entry,
                    ),
                  );
                }}
                onBlur={async (event) => {
                  await api.updateBranch(branch.id, {
                    status: branch.status,
                    manager_name: event.target.value,
                  });
                }}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <p className="mt-4 text-sm text-slate-400">{branch.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
