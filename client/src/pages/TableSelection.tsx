import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type PosFloorResponse } from '../api/api';
import { useAuth } from '../auth/AuthContext';

export default function TableSelection() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [floor, setFloor] = useState<PosFloorResponse | null>(null);

  useEffect(() => {
    api.getPosFloor().then(setFloor).catch(console.error);
  }, []);

  if (!floor) {
    return <div className="p-8 text-sm text-slate-300">Loading floor...</div>;
  }

  return (
    <div className="safe-top safe-bottom min-h-screen bg-slate-950 px-4 py-5 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="glass-panel mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              POS floor
            </p>
            <h1 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
              {floor.branch?.name ?? 'Floor Overview'}
            </h1>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-left sm:flex-none sm:text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Occupancy</p>
              <p className="font-bold">{floor.occupancyRate}%</p>
            </div>
            <button
              onClick={logout}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Tables</p>
            <p className="mt-3 text-3xl font-black sm:text-4xl">{floor.tables.length}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Active orders</p>
            <p className="mt-3 text-3xl font-black sm:text-4xl">{floor.activeOrders}</p>
          </div>
          <div className="col-span-2 rounded-[28px] border border-white/10 bg-white/5 p-5 md:col-span-1">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Zone</p>
            <p className="mt-3 text-2xl font-black">Main Floor</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {floor.tables.map((table) => (
            <button
              key={table.id}
              onClick={() => navigate(`/pos/table/${table.id}`)}
              className={`rounded-[28px] border p-5 text-left transition ${
                table.status === 'occupied'
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  {table.zone}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {table.status}
                </span>
              </div>
              <h2 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">
                Table {table.table_number}
              </h2>
              <p className="mt-2 text-sm text-slate-400">Seats {table.capacity}</p>
              <p className="mt-4 text-sm text-slate-300">
                Guests on floor: {table.current_guests}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
