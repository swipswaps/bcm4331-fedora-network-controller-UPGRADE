import { useState, useEffect } from 'react';
import { 
  Wifi, 
  Shield, 
  Activity, 
  Terminal, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Network,
  Database,
  History
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface SystemStatus {
  isHealthy: boolean;
  networkingEnabled: boolean;
  wifiEnabled: boolean;
  bundleReady: boolean;
  kernel: string;
  powerSave: string;
  isFixing: boolean;
  lastFixError: string | null;
  sudoPromptDetected: boolean;
  metricsHistory: any[];
  connectivity: string;
  ipAddr: string;
  wifiLink: string;
  nearbyAPs: string;
  arpTable: string;
  nmLogs: string;
  kernelLogs: string;
}

interface AuditData {
  status: string;
  verbatimLogSnippet: string;
  dbMilestones: string;
  commandFailures: string;
  message: string;
}

export default function App() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forensics' | 'logs'>('dashboard');
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error('Failed to fetch status', e);
    }
  };

  const fetchAudit = async () => {
    try {
      const res = await fetch('/api/audit');
      const data = await res.json();
      setAudit(data);
    } catch (e) {
      console.error('Failed to fetch audit', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchAudit();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFix = async () => {
    setLoading(true);
    try {
      await fetch('/api/fix', { method: 'POST' });
      setTimeout(() => {
        fetchStatus();
        fetchAudit();
        setLoading(false);
      }, 2000);
    } catch (e) {
      setLoading(false);
    }
  };

  const togglePowerSave = async (enabled: boolean) => {
    try {
      await fetch('/api/toggle-power-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      fetchStatus();
    } catch (e) {
      console.error('Toggle failed', e);
    }
  };

  if (!status) return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="animate-spin text-orange-500" size={48} />
        <p className="text-zinc-400">Initializing Control Center...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Wifi className="text-zinc-950" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Broadcom Control Center</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Forensic Recovery Engine v90</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg border border-zinc-700">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-md text-xs transition-all ${activeTab === 'dashboard' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('forensics')}
              className={`px-4 py-1.5 rounded-md text-xs transition-all ${activeTab === 'forensics' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Forensics
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-1.5 rounded-md text-xs transition-all ${activeTab === 'logs' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              System Logs
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatusCard 
            icon={<Activity size={18} />} 
            label="Health" 
            value={status.isHealthy ? 'Healthy' : 'Degraded'} 
            sub={status.connectivity}
            color={status.isHealthy ? 'text-emerald-500' : 'text-orange-500'}
          />
          <StatusCard 
            icon={<Wifi size={18} />} 
            label="Wi-Fi Radio" 
            value={status.wifiEnabled ? 'Enabled' : 'Disabled'} 
            sub={status.wifiState}
            color={status.wifiEnabled ? 'text-emerald-500' : 'text-zinc-500'}
          />
          <StatusCard 
            icon={<Network size={18} />} 
            label="Networking" 
            value={status.networkingEnabled ? 'Active' : 'Offline'} 
            sub={status.networkingState}
            color={status.networkingEnabled ? 'text-emerald-500' : 'text-red-500'}
          />
          <StatusCard 
            icon={<Shield size={18} />} 
            label="Sudo Access" 
            value={status.sudoPromptDetected ? 'Locked' : 'Unlocked'} 
            sub={status.sudoPromptDetected ? 'Password Required' : 'Passwordless Active'}
            color={status.sudoPromptDetected ? 'text-orange-500' : 'text-emerald-500'}
          />
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Controls & Info */}
            <div className="space-y-6">
              <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Zap size={14} /> Recommended Actions
                </h2>
                <button 
                  onClick={handleFix}
                  disabled={loading || status.isFixing}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10"
                >
                  {loading || status.isFixing ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  {status.isHealthy ? 'Force Forensic Recovery' : 'Execute Nuclear Repair'}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => togglePowerSave(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] py-2 rounded border border-zinc-700"
                  >
                    Disable Power Save
                  </button>
                  <button 
                    onClick={() => togglePowerSave(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] py-2 rounded border border-zinc-700"
                  >
                    Enable Power Save
                  </button>
                </div>
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Terminal size={14} /> Network Telemetry
                </h2>
                <div className="space-y-3">
                  <TelemetryItem label="IP Address" value={status.ipAddr || 'None'} />
                  <TelemetryItem label="Kernel" value={status.kernel} />
                  <TelemetryItem label="Power Save" value={status.powerSave} />
                  <TelemetryItem label="Firmware" value={status.bundleReady ? '📦 Ready' : '⚠️ Missing'} />
                </div>
              </section>
            </div>

            {/* Middle/Right: Charts & Details */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-[300px]">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                  <Activity size={14} /> Signal Strength (dBm)
                </h2>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={status.metricsHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis domain={[-100, 0]} stroke="#71717a" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                        itemStyle={{ color: '#f97316' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="signal" 
                        stroke="#f97316" 
                        strokeWidth={2} 
                        dot={false} 
                        animationDuration={300}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Wifi size={14} /> Nearby Access Points
                  </h2>
                  <pre className="text-[10px] text-zinc-400 overflow-x-auto leading-relaxed">
                    {status.nearbyAPs || 'Scanning...'}
                  </pre>
                </section>
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Network size={14} /> ARP Table
                  </h2>
                  <pre className="text-[10px] text-zinc-400 overflow-x-auto leading-relaxed">
                    {status.arpTable || 'Empty'}
                  </pre>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forensics' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-lg font-bold flex items-center gap-3">
                  <Database className="text-orange-500" /> SQLite Recovery Milestones
                </h2>
                <button 
                  onClick={fetchAudit}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
              
              <div className="space-y-4">
                {audit?.dbMilestones ? (
                  <div className="grid grid-cols-1 gap-2">
                    {audit.dbMilestones.split('\n').filter(l => l.trim()).map((line, i) => {
                      const [ts, name, details] = line.split('|');
                      return (
                        <div key={i} className="flex items-start gap-4 p-3 bg-zinc-950 rounded border border-zinc-800 hover:border-zinc-700 transition-colors">
                          <span className="text-[10px] text-zinc-500 font-mono pt-1">{ts}</span>
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">{name}</span>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">{details}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-500">
                    <History size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No milestones recorded yet. Run recovery to populate forensic data.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-3">
                <AlertTriangle className="text-red-500" /> Command Failure Audit
              </h2>
              <pre className="bg-zinc-950 p-4 rounded border border-zinc-800 text-[10px] text-red-400 overflow-x-auto">
                {audit?.commandFailures || 'No failures detected in last run.'}
              </pre>
            </section>
          </div>
        )}

        {activeTab === 'logs' && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[70vh] animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Verbatim Telemetry Stream</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">verbatim_handshake.log</span>
            </div>
            <div className="flex-1 p-4 bg-zinc-950 font-mono text-[11px] overflow-y-auto leading-relaxed selection:bg-orange-500/50">
              {status.nmLogs && (
                <div className="mb-6">
                  <p className="text-zinc-500 mb-2 border-b border-zinc-800 pb-1 uppercase text-[9px] font-bold tracking-widest">NetworkManager Journal</p>
                  <pre className="text-zinc-400 whitespace-pre-wrap">{status.nmLogs}</pre>
                </div>
              )}
              {status.kernelLogs && (
                <div className="mb-6">
                  <p className="text-zinc-500 mb-2 border-b border-zinc-800 pb-1 uppercase text-[9px] font-bold tracking-widest">Kernel Dmesg (b43/brcm)</p>
                  <pre className="text-orange-400/80 whitespace-pre-wrap">{status.kernelLogs}</pre>
                </div>
              )}
              <div>
                <p className="text-zinc-500 mb-2 border-b border-zinc-800 pb-1 uppercase text-[9px] font-bold tracking-widest">Recovery Handshake Log</p>
                <pre className="text-zinc-300 whitespace-pre-wrap">{audit?.verbatimLogSnippet || 'Waiting for log data...'}</pre>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-zinc-500 text-center md:text-left">
            <p>© 2026 Broadcom Recovery Kit. Deterministic Hardware Management.</p>
            <p>Built for Fedora 43+ | Request Compliant v90</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <div className={`w-2 h-2 rounded-full ${status.isHealthy ? 'bg-emerald-500' : 'bg-orange-500'}`} />
              System {status.isHealthy ? 'Stable' : 'Unstable'}
            </div>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <div className="text-[10px] text-zinc-500 font-mono">
              {new Date().toISOString()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatusCard({ icon, label, value, sub, color }: { icon: any, label: string, value: string, sub: string, color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-1 hover:border-zinc-700 transition-colors group">
      <div className="flex items-center gap-2 text-zinc-500 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color} flex items-center gap-2`}>
        {value}
        {value === 'Healthy' && <CheckCircle2 size={16} />}
      </div>
      <div className="text-[10px] text-zinc-500 font-mono truncate">{sub}</div>
    </div>
  );
}

function TelemetryItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px] border-b border-zinc-800/50 pb-2 last:border-0">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300 font-bold">{value}</span>
    </div>
  );
}

