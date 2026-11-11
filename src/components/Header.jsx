import React from 'react';
import { Shield, Activity, RefreshCw } from './Icons';

export default function Header({ backendStatus, onRefreshStatus }) {
  const isHealthy = backendStatus?.status === 'healthy';

  return (
    <header className="header-container">
      <div className="header-left">
        <div className="logo-badge">
          <div className="logo-icon-wrapper">
            <Shield className="logo-icon" size={24} />
          </div>
          <div>
            <div className="brand-row">
              <h1 className="brand-title">ShieldSMS</h1>
              <span className="version-pill">v1.0 AI</span>
            </div>
            <p className="brand-subtitle">Real-Time SMS Spam & Phishing Classification</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="meta-chip">
          <span className="meta-label">Model:</span>
          <span className="meta-value">MultinomialNB + TF-IDF</span>
        </div>

        <div className={`status-badge ${isHealthy ? 'status-online' : 'status-offline'}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {isHealthy ? 'ML Engine Online' : 'Connecting to API...'}
          </span>
          <button 
            className="status-refresh-btn" 
            onClick={onRefreshStatus}
            title="Refresh connection status"
            aria-label="Refresh connection"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
