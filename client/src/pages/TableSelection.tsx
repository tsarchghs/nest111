import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Table } from '../api/api';

export default function TableSelection() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await api.getTables();
      setTables(data);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = async (table: Table) => {
    try {
      if (table.status === 'available') {
        await api.updateTable(table.id, { status: 'occupied', current_guests: 2 });
      }
      navigate(`/table/${table.id}`);
    } catch (error) {
      console.error('Failed to select table:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'occupied':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'reserved':
        return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold text-slate-500">Loading tables...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">restaurant</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">POS System</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select a table to begin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            BS
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Available Tables</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableSelect(table)}
                className="relative bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-5xl text-slate-400 group-hover:text-primary transition-colors">
                    table_restaurant
                  </span>
                  <div className="text-center">
                    <div className="text-2xl font-bold">Table {table.table_number}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Seats {table.capacity}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(table.status)}`}
                  >
                    {table.status.toUpperCase()}
                  </span>
                  {table.status === 'occupied' && (
                    <div className="text-xs text-slate-500">
                      {table.current_guests} guests
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
