import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Leaf, Activity, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats'),
      api.get('/predict/history?limit=5'),
    ]).then(([statsRes, historyRes]) => {
      setStats(statsRes.data.stats);
      setRecent(historyRes.data.predictions);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-700 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <Link to="/scan" className="bg-primary-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center gap-2">
          <Leaf className="w-4 h-4" />
          Scan Crop
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Scans</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.total_scans || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Today</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.today_scans || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Users</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.total_users || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Diseases</p>
              <p className="text-2xl font-bold text-slate-800">10</p>
            </div>
          </div>
        </div>
      </div>

      {stats?.top_diseases?.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Detected Diseases</h2>
          <div className="space-y-3">
            {stats.top_diseases.map((d: any) => (
              <div key={d.disease} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-36">{d.disease}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                  <div className="bg-primary-500 h-full rounded-full flex items-center justify-end px-2" style={{ width: `${Math.max((d.count / stats.total_scans) * 100, 10)}%` }}>
                    <span className="text-xs font-medium text-white">{d.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Recent Scans</h2>
          <Link to="/history" className="text-sm text-primary-700 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Leaf className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No scans yet. Upload your first leaf photo!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((p: any) => (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-primary-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{p.top_prediction}</p>
                  <p className="text-sm text-slate-500">{p.filename}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${p.severity === 'Low' ? 'bg-green-100 text-green-700' : p.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{p.confidence}%</span>
                  <p className="text-xs text-slate-400 mt-1">{new Date(p.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
