import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Settings, 
  Terminal, 
  Zap, 
  Key, 
  Lock, 
  Unlock, 
  FileCheck, 
  Activity,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Database
} from 'lucide-react';
import QuantumVaultEngine from './utils/QuantumClientEngine';

const PQC_ALGORITHMS = ['RSA', 'ECDSA', 'ML-DSA', 'Hybrid'];

function App() {
  const [config, setConfig] = useState({
    baseUrl: 'https://be.quantumvault.tech',
    authKeyId: '',
    authAlgo: 'RSA',
    authPrivateKey: ''
  });
  
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('sign');
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState('unknown');
  
  // Operation Inputs
  const [signData, setSignData] = useState('Hello QuantumWorld');
  const [pqcKeyId, setPqcKeyId] = useState('');
  const [verifySig, setVerifySig] = useState('');
  const [cipherText, setCipherText] = useState('');
  const [iv, setIv] = useState('');
  const [authTag, setAuthTag] = useState('');

  const logEndRef = useRef(null);

  useEffect(() => {
    // Load config from localStorage
    const saved = localStorage.getItem('qv_tester_config');
    if (saved) setConfig(JSON.parse(saved));
    checkHealth();
  }, []);

  useEffect(() => {
    localStorage.setItem('qv_tester_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${config.baseUrl}/api/health`);
      if (res.ok) setHealth('online');
      else setHealth('degraded');
    } catch {
      setHealth('offline');
    }
  };

  const addLog = (entry) => {
    setLogs(prev => [...prev, { ...entry, id: Date.now(), time: new Date().toLocaleTimeString() }]);
  };

  const handleRun = async (operation) => {
    setLoading(true);
    const engine = new QuantumVaultEngine(config);
    let result;

    try {
      switch (operation) {
        case 'sign':
          result = await engine.request('/api/crypto/sign', { pqcKeyId, authKeyId: config.authKeyId, data: signData });
          if (result.success) setVerifySig(result.data.signature);
          break;
        case 'verify':
          result = await engine.request('/api/crypto/verify', { pqcKeyId, authKeyId: config.authKeyId, data: signData, signature: verifySig });
          break;
        case 'encapsulate':
          result = await engine.request('/api/crypto/encapsulate', { pqcKeyId, authKeyId: config.authKeyId });
          break;
        case 'decapsulate':
          result = await engine.request('/api/crypto/decapsulate', { pqcKeyId, authKeyId: config.authKeyId, ciphertext: cipherText });
          break;
        case 'encrypt':
          result = await engine.request('/api/crypto/encrypt', { pqcKeyId, authKeyId: config.authKeyId, data: signData });
          if (result.success) {
            setCipherText(result.data.ciphertext);
            setIv(result.data.iv);
            setAuthTag(result.data.authTag);
          }
          break;
        case 'decrypt':
          result = await engine.request('/api/crypto/decrypt', { 
            pqcKeyId, 
            authKeyId: config.authKeyId, 
            ciphertext: cipherText, 
            iv, 
            authTag 
          });
          break;
        default: break;
      }
      addLog(result);
    } catch (err) {
      addLog({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="main-header animate-fade">
        <div className="logo-section">
          <Shield className="logo-icon" size={32} />
          <div>
            <h1 className="gradient-text">QuantumVault PQC-Tester</h1>
            <p className="text-muted">Enterprise API Hardening Console</p>
          </div>
        </div>
        
        <div className="status-badge" data-status={health}>
          <Activity size={16} />
          <span>System: {health.toUpperCase()}</span>
          <RefreshCw size={14} className="refresh-icon" onClick={checkHealth} />
        </div>
      </header>

      <main className="main-content">
        {/* LEFT: CONFIGURATION */}
        <section className="config-panel glass-card animate-fade">
          <div className="panel-header">
            <Settings size={20} />
            <h2>API Configuration</h2>
          </div>
          
          <div className="form-group">
            <label>Vault Endpoint</label>
            <input 
              type="text" 
              value={config.baseUrl} 
              onChange={e => setConfig({...config, baseUrl: e.target.value})}
              placeholder="https://be..."
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Auth Key ID</label>
              <input 
                type="text" 
                value={config.authKeyId} 
                onChange={e => setConfig({...config, authKeyId: e.target.value})}
                placeholder="z41r62..."
              />
            </div>
            <div className="form-group flex-1">
              <label>Algorithm</label>
              <select 
                value={config.authAlgo} 
                onChange={e => setConfig({...config, authAlgo: e.target.value})}
              >
                {PQC_ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Unified Private Key (PEM/HEX)</label>
            <textarea 
              rows={5}
              value={config.authPrivateKey} 
              onChange={e => setConfig({...config, authPrivateKey: e.target.value})}
              placeholder="-----BEGIN... or hex string..."
            />
          </div>

          <div className="mtls-info">
            <AlertTriangle className="warning-icon" size={16} />
            <p><strong>Note:</strong> mTLS must be configured at the browser level (Settings -{'>'} Certificates).</p>
          </div>
        </section>

        {/* CENTER: OPERATIONS */}
        <section className="ops-panel glass-card animate-fade">
          <div className="tabs">
            <button className={activeTab === 'sign' ? 'active' : ''} onClick={() => setActiveTab('sign')}>
              <FileCheck size={18} /> Sign/Verify
            </button>
            <button className={activeTab === 'kem' ? 'active' : ''} onClick={() => setActiveTab('kem')}>
              <RefreshCw size={18} /> KEM
            </button>
            <button className={activeTab === 'encrypt' ? 'active' : ''} onClick={() => setActiveTab('encrypt')}>
              <Lock size={18} /> GCM
            </button>
          </div>

          <div className="tab-content">
            <div className="form-group">
              <label>PQC Key ID (Target Key)</label>
              <input 
                type="text" 
                value={pqcKeyId} 
                onChange={e => setPqcKeyId(e.target.value)}
                placeholder="znb9eshl..."
              />
            </div>

            {activeTab === 'sign' && (
              <div className="animate-fade">
                <div className="form-group">
                  <label>Data to Sign / Verify</label>
                  <textarea 
                    value={signData} 
                    onChange={e => setSignData(e.target.value)}
                    placeholder="Enter payload data..."
                  />
                </div>
                <div className="form-group">
                  <label>Signature (Hex)</label>
                  <input 
                    type="text" 
                    value={verifySig} 
                    onChange={e => setVerifySig(e.target.value)}
                    placeholder="Signature will appear here..."
                  />
                </div>
                <div className="btn-group">
                  <button onClick={() => handleRun('sign')} disabled={loading}>
                    <Zap size={16} /> Sign (ML-DSA)
                  </button>
                  <button onClick={() => handleRun('verify')} disabled={loading} className="btn-secondary">
                    <Shield size={16} /> Verify Signature
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'kem' && (
              <div className="animate-fade">
                <div className="form-group">
                  <label>Ciphertext (for Decapsulation)</label>
                  <input 
                    type="text" 
                    value={cipherText} 
                    onChange={e => setCipherText(e.target.value)}
                    placeholder="Enter encapsulated ciphertext..."
                  />
                </div>
                <div className="btn-group">
                  <button onClick={() => handleRun('encapsulate')} disabled={loading}>
                    <RefreshCw size={16} /> Encapsulate (ML-KEM)
                  </button>
                  <button onClick={() => handleRun('decapsulate')} disabled={loading} className="btn-secondary">
                    <Key size={16} /> Decapsulate
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'encrypt' && (
              <div className="animate-fade">
                <div className="form-group">
                  <label>Ciphertext / Message</label>
                  <textarea 
                    value={cipherText} 
                    onChange={e => setCipherText(e.target.value)}
                    placeholder="Encrypted data..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>IV</label>
                    <input type="text" value={iv} onChange={e => setIv(e.target.value)} />
                  </div>
                  <div className="form-group flex-1">
                    <label>Auth Tag</label>
                    <input type="text" value={authTag} onChange={e => setAuthTag(e.target.value)} />
                  </div>
                </div>
                <div className="btn-group">
                  <button onClick={() => handleRun('encrypt')} disabled={loading}>
                    <Lock size={16} /> Encrypt
                  </button>
                  <button onClick={() => handleRun('decrypt')} disabled={loading} className="btn-secondary">
                    <Unlock size={16} /> Decrypt
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: CONSOLE */}
        <section className="console-panel glass-card animate-fade">
          <div className="panel-header">
            <Terminal size={20} />
            <h2>Security Console</h2>
          </div>
          
          <div className="console-logs">
            {logs.length === 0 ? (
              <div className="empty-state">
                <Database size={40} />
                <p>Run an operation to see raw logs</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`log-entry ${log.success ? 'success' : 'error'}`}>
                  <div className="log-header">
                    <span>{log.time} - {log.request.url}</span>
                    <span className="latency">{log.latency}ms</span>
                  </div>
                  <div className="log-summary">
                    {log.success ? (
                      <span className="status-text">✓ {log.status} OK</span>
                    ) : (
                      <span className="status-text">✗ {log.status || 'FAIL'}</span>
                    )}
                  </div>
                  <pre className="log-json">
                    {JSON.stringify(log.success ? log.data : { error: log.error }, null, 2)}
                  </pre>
                  <details className="raw-request">
                    <summary>Raw Headers & Payload</summary>
                    <pre>{JSON.stringify(log.request.headers, null, 2)}</pre>
                  </details>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </section>
      </main>

      <style>{`
        .app-container {
          padding: 1rem;
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .app-container {
            padding: 2rem;
            gap: 2rem;
          }
        }

        .main-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          justify-content: space-between;
          align-items: flex-start;
        }

        @media (min-width: 768px) {
          .main-header {
            flex-direction: row;
            align-items: center;
          }
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          color: var(--accent-primary);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.05);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-badge[data-status="online"] { color: var(--success); }
        .status-badge[data-status="offline"] { color: var(--error); }
        .refresh-icon { cursor: pointer; opacity: 0.5; }
        .refresh-icon:hover { opacity: 1; }

        .main-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: flex-start;
        }

        @media (min-width: 1024px) {
          .main-content {
            grid-template-columns: 350px 1fr;
          }
        }

        @media (min-width: 1440px) {
          .main-content {
            grid-template-columns: 350px 1fr 400px;
          }
        }

        .panel-header {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .panel-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .form-group {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 0 1.25rem;
        }

        @media (min-width: 640px) {
          .form-row {
            flex-direction: row;
          }
        }

        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }

        label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        input, select, textarea {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-main);
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }

        input:focus, select:focus, textarea:focus {
          border-color: var(--accent-primary);
        }

        .mtls-info {
          margin: 1.25rem;
          padding: 1rem;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 8px;
          display: flex;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: var(--warning);
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          overflow-x: auto;
        }

        .tabs button {
          flex: 1;
          min-width: 120px;
          padding: 1rem;
          background: transparent;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .tabs button.active {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          background: rgba(0, 242, 255, 0.05);
        }

        .btn-group {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .btn-group {
            flex-direction: row;
          }
        }

        .btn-group button {
          flex: 1;
          padding: 0.85rem;
          border-radius: 8px;
          background: var(--accent-primary);
          color: #000;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-group button.btn-secondary {
          background: transparent;
          border: 1px solid var(--accent-primary);
          color: var(--accent-primary);
        }

        .btn-group button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .console-panel {
          min-height: 400px;
          height: auto;
          display: flex;
          flex-direction: column;
        }

        @media (min-width: 1440px) {
          .console-panel {
            height: 80vh;
          }
        }

        .console-logs {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .log-entry {
          background: rgba(255, 255, 255, 0.02);
          border-left: 3px solid var(--border-color);
          padding: 1rem;
          border-radius: 4px;
          word-break: break-all;
        }

        .log-entry.success { border-color: var(--success); }
        .log-entry.error { border-color: var(--error); }

        .log-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        @media (min-width: 640px) {
          .log-header {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .status-text {
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .log-json {
          background: #000;
          padding: 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          max-height: 300px;
          overflow-y: auto;
          color: #33ff33;
        }

        .raw-request {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0.2;
          gap: 1rem;
          padding: 3rem 0;
        }
      `}</style>
    </div>
  );
}

export default App;
