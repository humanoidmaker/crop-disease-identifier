import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Clock, ChevronLeft, ChevronRight, Leaf, X, Pill, Shield } from 'lucide-react';

export default function History() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const limit = 10;

  const fetchHistory = (skip: number) => {
    setLoading(true);
    api.get(`/predict/history?skip=${skip}&limit=${limit}`).then((res) => {
      setPredictions(res.data.predictions);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(page * limit); }, [page]);

  const openDetail = async (id: string) => {
    try {
      const res = await api.get(`/predict/${id}`);
      setDetail(res.data.prediction);
    } catch { /* ignore */ }
  };

  const severityBadge = (s: string) => {
    const colors = s === 'Low' ? 'bg-green-100 text-green-700' : s === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Scan History
      </h1>

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">{detail.top_prediction}</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {detail.image_thumbnail && (
              <img src={`data:${detail.content_type};base64,${detail.image_thumbnail}`} alt="Leaf" className="w-full rounded-xl mb-4 max-h-48 object-cover" />
            )}
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Confidence</span><span className="font-semibold">{detail.confidence}%</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Severity</span>{severityBadge(detail.severity)}</div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Affected Crops</span><span className="text-sm">{detail.affected_crops}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Date</span><span className="text-sm">{new Date(detail.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span></div>

              <div>
                <h3 className="font-medium text-slate-700 flex items-center gap-1 mb-1"><Pill className="w-4 h-4 text-primary-700" /> Treatment</h3>
                <div className="bg-primary-50 rounded-lg p-3"><p className="text-sm text-primary-900">{detail.treatment}</p></div>
              </div>

              {detail.prevention?.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-700 flex items-center gap-1 mb-1"><Shield className="w-4 h-4 text-green-600" /> Prevention</h3>
                  <ul className="space-y-1">
                    {detail.prevention.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h3 className="font-medium text-slate-700 pt-2">All Predictions</h3>
              {detail.all_predictions?.map((p: any) => (
                <div key={p.condition} className="flex items-center gap-2">
                  <span className="text-sm w-32 text-slate-600">{p.condition}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-primary-500 h-full rounded-full" style={{ width: `${Math.max(p.confidence, 2)}%` }} />
                  </div>
                  <span className="text-xs font-medium w-12 text-right">{p.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-700 border-t-transparent rounded-full" /></div>
      ) : predictions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <Leaf className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No scans yet</p>
          <p className="text-slate-400 text-sm mt-1">Your scan history will appear here</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-500">Disease</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 hidden sm:table-cell">File</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-slate-500">Confidence</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-slate-500">Severity</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-500 hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {predictions.map((p) => (
                  <tr key={p.id} onClick={() => openDetail(p.id)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.top_prediction}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell truncate max-w-[150px]">{p.filename}</td>
                    <td className="px-4 py-3 text-center"><span className="font-semibold text-slate-700">{p.confidence}%</span></td>
                    <td className="px-4 py-3 text-center">{severityBadge(p.severity)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-500 hidden sm:table-cell">{new Date(p.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 0} className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(page + 1)} disabled={(page + 1) * limit >= total} className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
