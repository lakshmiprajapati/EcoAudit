// web-client/src/App.jsx
import { useState } from 'react'
import axios from 'axios'
import { Leaf, Activity, Zap, Award, AlertTriangle, Globe, ArrowRight, CheckCircle, ChevronDown } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [url, setUrl] = useState('')
  const [region, setRegion] = useState('global') 
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAudit = async () => {
    if (!url) return alert("Please enter a URL")
    setLoading(true); setError(null); setResult(null);

    try {
      const response = await axios.post('http://localhost:8000/audit', {
        url: url,
        region: region
      })
      setResult(response.data)
    } catch (err) {
      console.error(err)
      setError("Connection Failed. Ensure backend is running on port 8000.")
    } finally {
      setLoading(false)
    }
  }

  // --- THIS IS THE MISSING PART ---
  const handleReset = () => {
    setResult(null);
    setUrl('');
    setError(null);
  }
  // -------------------------------

  const getChartData = () => {
    if (!result || !result.network_metrics) return null;
    const r = result.network_metrics.breakdown;
    return {
      labels: ['Images', 'Scripts', 'CSS', 'Other'],
      datasets: [{
        data: [r.image, r.script, r.stylesheet, r.other],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#64748b'],
        borderWidth: 0,
        cutout: '75%',
      }],
    };
  };

  const getGradeColor = (g) => g === 'A' ? '#10b981' : (g === 'B' ? '#f59e0b' : '#ef4444');

  return (
    <div className="container">
      {/* NAVBAR with Working Button */}
      <nav className="navbar">
        <div className="logo" onClick={handleReset} style={{cursor: 'pointer'}}>
          <Leaf size={28} /> EcoAudit
        </div>
        {/* Only show button if we have results */}
        {result && (
          <button className="btn-outline" onClick={handleReset}>
            New Audit
          </button>
        )}
      </nav>

      {/* HERO SECTION */}
      {!result && (
        <div className="hero-section animate-fade-in">
          <div className="hero-icon-wrapper">
             <Leaf size={48} color="#10b981" />
          </div>
          <h1 className="hero-title">
            <span style={{ color: '#10b981' }}>Eco</span>Audit
          </h1>
          <p className="hero-subtitle">
            Measure, Predict, and Reduce your Digital Carbon Footprint
          </p>

          <div className="search-box">
            <input 
              type="text" 
              className="search-input"
              placeholder="Enter website URL (e.g., https://google.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            
            {/* IMPROVED DROPDOWN WRAPPER */}
            <div className="select-wrapper">
              <select 
                className="search-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="global">🌍 Global</option>
                <option value="in">🇮🇳 India</option>
                <option value="fr">🇫🇷 France</option>
                <option value="us">🇺🇸 USA</option>
              </select>
              <ChevronDown className="select-icon" size={16} />
            </div>

            <button className="btn-primary" onClick={handleAudit} disabled={loading}>
              {loading ? 'Scanning...' : 'Scan Now'}
            </button>
          </div>
          {error && <div className="error-msg">{error}</div>}
        </div>
      )}

      {/* RESULTS DASHBOARD */}
      {result && (
        <div className="dashboard animate-slide-up">
          <div className="stats-grid">
            <div className="stat-card" style={{ borderColor: getGradeColor(result.grade) }}>
              <div className="stat-header">
                Sustainability Grade <Award size={18} color={getGradeColor(result.grade)} />
              </div>
              <div className="stat-value" style={{ color: getGradeColor(result.grade), fontSize: '3.5rem' }}>
                {result.grade}
              </div>
              <div className="stat-sub">{result.grade === 'A' ? 'Excellent Work' : 'Needs Improvement'}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">Carbon Footprint <Activity size={18} color="#ef4444" /></div>
              <div className="stat-value">
                {result.co2_grams.toFixed(2)}<span className="unit">g</span>
              </div>
              <div className="stat-sub">CO2e per visit</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">Page Weight <Globe size={18} color="#3b82f6" /></div>
              <div className="stat-value">
                {(result.total_bytes / (1024*1024)).toFixed(2)}<span className="unit">MB</span>
              </div>
              <div className="stat-sub">Total resources loaded</div>
            </div>

            <div className="stat-card ai-card">
              <div className="stat-header" style={{ color: '#10b981' }}>
                AI Annual Projection <Zap size={18} />
              </div>
              <div className="stat-value" style={{ color: '#10b981' }}>
                {result.annual_projection_kg?.toFixed(1)}<span className="unit">kg</span>
              </div>
              <div className="stat-sub">Projected annual emission</div>
            </div>
          </div>

          <div className="dashboard-row">
            <div className="content-card">
              <h3>Resource Breakdown</h3>
              {result.network_metrics ? (
                <div className="chart-container">
                   <Doughnut data={getChartData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
                </div>
              ) : (
                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '2rem' }}>Chart data unavailable</p>
              )}
            </div>

            <div className="content-card">
              <h3>Optimization Action Plan</h3>
              <div className="action-list">
                {result.recommendations?.map((rec, index) => (
                  <div key={index} className="action-item">
                    <div className="action-header">
                      {rec.priority === 'High' ? <AlertTriangle size={20} color="#ef4444" /> : <CheckCircle size={20} color="#f59e0b" />}
                      <strong>{rec.title}</strong>
                      <span className={`badge badge-${rec.priority.toLowerCase()}`}>{rec.priority}</span>
                    </div>
                    <p>{rec.desc}</p>
                    <div className="impact-pill">
                      <Zap size={14} fill="#10b981" /> {rec.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
