// web-client/src/App.jsx
import { useState } from 'react'
import axios from 'axios'

function App() {
  const [url, setUrl] = useState('')
  const [region, setRegion] = useState('global') // Default region
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAudit = async () => {
    // Basic Validation
    if (!url) return alert("Please enter a URL")
    
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // THE API CALL
      // We talk to Python on port 8000
      const response = await axios.post('http://localhost:8000/audit', {
        url: url,
        region: region
      })

      setResult(response.data)
    } catch (err) {
      console.error(err)
      setError("Audit failed. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '50px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>🌱 EcoAudit Dashboard</h1>
      
      {/* INPUT SECTION */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="https://example.com" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <select 
          value={region} 
          onChange={(e) => setRegion(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px' }}
        >
          <option value="global">🌍 Global Avg</option>
          <option value="in">🇮🇳 India</option>
          <option value="fr">🇫🇷 France</option>
          <option value="us">🇺🇸 USA</option>
        </select>

        <button 
          onClick={handleAudit}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            background: loading ? '#ccc' : '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Scanning...' : 'Audit Now'}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {/* RESULTS SECTION */}
      {result && (
        <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', background: '#f9f9f9' }}>
          <h2>📊 Audit Report</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center' }}>
            {/* Grade Card */}
            <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#777' }}>Sustainability Grade</div>
              <div style={{ fontSize: '40px', fontWeight: 'bold', color: result.grade === 'A' ? '#27ae60' : '#e74c3c' }}>
                {result.grade}
              </div>
            </div>

            {/* CO2 Card */}
            <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#777' }}>Carbon Footprint</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {result.co2_grams} g
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>CO2e per visit</div>
            </div>

            {/* Energy Card */}
            <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#777' }}>Page Weight</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {(result.total_bytes / 1024).toFixed(0)} KB
              </div>
            </div>
          </div>

          <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            *Calculated using {result.region.toUpperCase()} grid intensity ({result.energy_kwh.toFixed(6)} kWh energy usage).
          </p>
        </div>
      )}
    </div>
  )
}

export default App