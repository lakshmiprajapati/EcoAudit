// web-client/src/Integration.jsx
import React, { useState } from 'react';
import { Terminal, Key, Copy, Check, Server, Shield, CheckCircle } from 'lucide-react';
import './App.css'; // Re-use existing dark theme

const Integration = () => {
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const apiKey = "eco_live_sk_92834792834729384729384";
  
  const yamlCode = `name: Carbon Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install EcoAudit CLI
        run: pip install ecoaudit-cli
      
      - name: Run Carbon Check
        env:
          ECO_KEY: \${{ secrets.ECO_KEY }}
        run: |
          carbon-audit --url \${{ env.DEPLOY_URL }} --limit 0.5`;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem' }}>CI/CD & API Integration</h1>
        <p className="hero-subtitle">Automate sustainability checks in your development workflow.</p>
      </div>

      {/* API KEY CARD */}
      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <div className="stat-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: 'white' }}>
            <Key size={20} color="#f59e0b" /> API Key Management
          </span>
          <span className="badge badge-high" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Active</span>
        </div>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
          Use this key to authenticate your CLI requests. Do not share this key publicly.
        </p>
        
        <div className="search-box" style={{ padding: '0', overflow: 'hidden', alignItems: 'center' }}>
          <div style={{ padding: '1rem', fontFamily: 'monospace', color: '#10b981', flex: 1, fontSize: '0.9rem' }}>
            {apiKey}
          </div>
          <button 
            onClick={() => handleCopy(apiKey, 'api')}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              borderLeft: '1px solid #334155', 
              color: 'white', 
              padding: '1rem 1.5rem', 
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {copied === 'api' ? <Check size={18} color="#10b981"/> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="dashboard-row">
        
        {/* LEFT: CLI INSTRUCTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="content-card">
            <div className="stat-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: 'white' }}>
                <Terminal size={20} color="#3b82f6" /> Install CLI
              </span>
            </div>
            <div className="action-item" style={{ background: '#0f172a', fontFamily: 'monospace', color: '#f8fafc', border: '1px solid #334155', padding: '1rem' }}>
              $ pip install ecoaudit-cli
            </div>
            <div className="action-item" style={{ background: '#0f172a', fontFamily: 'monospace', color: '#f8fafc', border: '1px solid #334155', padding: '1rem' }}>
              $ carbon-audit --url google.com
            </div>
          </div>

          <div className="content-card">
            <div className="stat-header">
               <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: 'white' }}>
                <Shield size={20} color="#10b981" /> Features
              </span>
            </div>
            <div className="action-list">
              <div className="action-item" style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '1rem' }}>
                <CheckCircle size={16} color="#10b981" /> <span>Blocks dirty builds automatically</span>
              </div>
              <div className="action-item" style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '1rem' }}>
                <CheckCircle size={16} color="#10b981" /> <span>Detailed JSON audit reports</span>
              </div>
              <div className="action-item" style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '1rem' }}>
                <CheckCircle size={16} color="#10b981" /> <span>GitHub Actions & GitLab support</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: GITHUB ACTIONS YAML */}
        <div className="content-card">
          <div className="stat-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: 'white' }}>
              <Server size={20} color="#ef4444" /> CI/CD Configuration
            </span>
            <button 
              onClick={() => handleCopy(yamlCode, 'yaml')}
              className="btn-outline" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              {copied === 'yaml' ? 'Copied!' : 'Copy YAML'}
            </button>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Add this to <code>.github/workflows/carbon.yml</code>
          </p>
          <pre style={{ 
            background: '#0f172a', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            overflowX: 'auto', 
            fontFamily: 'monospace', 
            fontSize: '0.85rem', 
            lineHeight: '1.5', 
            color: '#e2e8f0',
            border: '1px solid #334155'
          }}>
            {yamlCode}
          </pre>
        </div>

      </div>
    </div>
  );
};

export default Integration;