import { useState, useEffect } from 'react'

function App() {
  const [metrics, setMetrics] = useState([]);
  const [kpis, setKpis] = useState({ avgTime: 0, successRate: 0, total: 0 });

  useEffect(() => {
    // Fetch live data directly from your GitHub repository (Cache-busted to ensure fresh data)
    const liveDataUrl = 'https://raw.githubusercontent.com/Braveen811/build-pulse-analytics/main/data/metrics.json';
    
    fetch(`${liveDataUrl}?t=${Date.now()}`)
      .then((res) => res.json())
      .then((allMetrics) => {
        // Calculate Analytics
        const total = allMetrics.length;
        const avgTime = total > 0 ? Math.round(allMetrics.reduce((acc, curr) => acc + curr.duration_seconds, 0) / total) : 0;
        const successCount = allMetrics.filter(m => m.status === 'success').length;
        const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

        setKpis({ avgTime, successRate, total });
        setMetrics(allMetrics.reverse()); // Show newest first
      })
      .catch((err) => console.error("Error loading live metrics:", err));
  }, []);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 tracking-widest text-white mt-10">
        BUILD PULSE <span className="text-command-accent">ANALYTICS</span>
      </h1>
      
      <div className="w-full max-w-4xl">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-command-bg border border-command-accent shadow-[0_0_15px_var(--color-command-shadow)] p-6 rounded-lg text-center">
            <p className="text-sm text-gray-300 uppercase tracking-wider mb-2">Total Runs</p>
            <p className="text-4xl font-bold text-white">{kpis.total}</p>
          </div>
          <div className="bg-command-bg border border-command-accent shadow-[0_0_15px_var(--color-command-shadow)] p-6 rounded-lg text-center">
            <p className="text-sm text-gray-300 uppercase tracking-wider mb-2">Avg Build Time</p>
            <p className="text-4xl font-bold text-white">{kpis.avgTime}s</p>
          </div>
          <div className="bg-command-bg border border-command-accent shadow-[0_0_15px_var(--color-command-shadow)] p-6 rounded-lg text-center">
            <p className="text-sm text-gray-300 uppercase tracking-wider mb-2">Success Rate</p>
            <p className="text-4xl font-bold text-white">{kpis.successRate}%</p>
          </div>
        </div>

        {/* Pipeline History List */}
        <div className="bg-command-bg border border-command-accent shadow-[0_0_25px_var(--color-command-shadow)] p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-200 border-b border-command-accent pb-2">
            Pipeline History
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {metrics.map(run => (
              <div key={run.id} className="flex justify-between items-center bg-black/40 p-4 rounded-md border-l-4 border-command-accent">
                <div>
                  <span className="font-mono text-gray-300 block">{run.id}</span>
                  <span className="text-xs text-gray-500">{new Date(run.date).toLocaleString()}</span>
                </div>
                <span className="text-2xl font-bold text-white">{run.duration_seconds}s</span>
                <span className={`px-3 py-1 rounded text-sm font-bold uppercase tracking-widest ${run.status === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                  {run.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App