import { useEffect, useState } from 'react';
import { api, type BankAccount } from '../api/api';

export default function AdminBankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  const load = async () => {
    const response = await api.getBankAccounts();
    setAccounts(response.accounts);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-primary/80">Finance</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Bank Accounts</h1>
      </div>

      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-6 md:grid-cols-[1.2fr_0.8fr]"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                {account.bank_name}
              </p>
              <input
                value={account.account_name}
                onChange={(event) => {
                  setAccounts((current) =>
                    current.map((entry) =>
                      entry.id === account.id
                        ? { ...entry, account_name: event.target.value }
                        : entry,
                    ),
                  );
                }}
                onBlur={async (event) => {
                  await api.updateBankAccount(account.id, {
                    status: account.status,
                    account_name: event.target.value,
                  });
                }}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-lg font-bold outline-none focus:border-primary"
              />
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>IBAN {account.iban}</span>
                <span>SWIFT {account.swift_code}</span>
                <span>•••• {account.account_number_last4}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Status</p>
                <p className="mt-2 text-lg font-bold">{account.currency_code}</p>
              </div>
              <select
                value={account.status}
                onChange={async (event) => {
                  await api.updateBankAccount(account.id, {
                    status: event.target.value,
                    account_name: account.account_name,
                  });
                  await load();
                }}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
