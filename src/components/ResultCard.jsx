import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Copy, Check, Flame, Activity } from './Icons';

export default function ResultCard({ result, isLoading, error }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    const summary = `ShieldSMS Classification: ${result.prediction}\nConfidence: ${result.confidence}%\nMessage: "${result.message}"`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="result-card result-card-loading">
        <div className="loading-card-content">
          <div className="loading-pulse-shield">
            <Activity className="loading-spinner-icon" size={40} />
          </div>
          <h3 className="loading-title">Extracting Features & Classifying...</h3>
          <p className="loading-subtitle">
            Running TF-IDF vectorization and Multinomial Naive Bayes probabilistic inference.
          </p>
          <div className="loading-skeleton-bar">
            <div className="loading-skeleton-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Handled by top-level error banner
  }

  if (!result) {
    return (
      <div className="result-card result-card-empty">
        <div className="empty-state-content">
          <div className="empty-icon-ring">
            <Sparkles size={28} className="text-accent" />
          </div>
          <h3 className="empty-title">Awaiting Message Input</h3>
          <p className="empty-desc">
            Type or paste an SMS in the message inspector and click <strong>Check Message</strong> to evaluate whether it is legitimate (HAM) or an unsolicited threat (SPAM).
          </p>
          <div className="empty-tags">
            <span className="empty-tag">✓ Scikit-Learn Model</span>
            <span className="empty-tag">✓ Probabilistic Scoring</span>
            <span className="empty-tag">✓ Zero Mock Data</span>
          </div>
        </div>
      </div>
    );
  }

  const isSpam = result.is_spam;
  const spamProb = result.probabilities?.spam ?? (isSpam ? 100 : 0);
  const hamProb = result.probabilities?.ham ?? (isSpam ? 0 : 100);

  return (
    <div className={`result-card ${isSpam ? 'result-theme-spam' : 'result-theme-ham'}`}>
      {/* Banner Verdict */}
      <div className="verdict-banner">
        <div className="verdict-left">
          <div className="verdict-icon-container">
            {isSpam ? (
              <ShieldAlert size={36} className="verdict-icon spam-pulse" />
            ) : (
              <ShieldCheck size={36} className="verdict-icon ham-glow" />
            )}
          </div>
          <div className="verdict-text-group">
            <div className="verdict-classification">
              <span className="verdict-label">Prediction:</span>
              <span className={`verdict-badge ${isSpam ? 'badge-spam' : 'badge-ham'}`}>
                {isSpam ? 'SPAM DETECTED' : 'HAM (LEGITIMATE)'}
              </span>
            </div>
            <p className="verdict-message">
              {isSpam
                ? 'High risk alert. This message displays typical phishing, lottery scam, or promotional spam signatures.'
                : 'Safe message. This communication exhibits standard conversational or authentic informational patterns.'}
            </p>
          </div>
        </div>

        <div className="verdict-right">
          <button
            type="button"
            className="btn-copy-result"
            onClick={handleCopy}
            title="Copy analysis summary"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Confidence Gauge */}
      <div className="confidence-section">
        <div className="confidence-header">
          <div className="confidence-title-group">
            <span className="confidence-heading">Model Confidence</span>
            <span className="confidence-badge-value">
              {result.confidence}% Certain
            </span>
          </div>
          <span className="confidence-subtext">MultinomialNB Posterior Probability</span>
        </div>

        {/* Probability bar */}
        <div className="prob-meter">
          <div
            className="prob-meter-fill prob-meter-spam"
            style={{ width: `${spamProb}%` }}
            title={`Spam Probability: ${spamProb}%`}
          >
            {spamProb > 15 && <span className="meter-label">{spamProb}% Spam</span>}
          </div>
          <div
            className="prob-meter-fill prob-meter-ham"
            style={{ width: `${hamProb}%` }}
            title={`Ham Probability: ${hamProb}%`}
          >
            {hamProb > 15 && <span className="meter-label">{hamProb}% Ham</span>}
          </div>
        </div>

        <div className="prob-meter-legend">
          <div className="legend-item text-danger">
            <span className="legend-dot bg-danger"></span>
            <span>Spam Probability: <strong>{spamProb}%</strong></span>
          </div>
          <div className="legend-item text-success">
            <span className="legend-dot bg-success"></span>
            <span>Ham (Legitimate): <strong>{hamProb}%</strong></span>
          </div>
        </div>
      </div>

      {/* Triggers & Statistics Breakdown */}
      <div className="breakdown-grid">
        <div className="breakdown-card">
          <div className="breakdown-card-title">
            <Flame size={14} className={isSpam ? 'text-danger' : 'text-muted'} />
            <span>Spam Indicators</span>
          </div>
          <div className="trigger-chips-list">
            {result.detected_triggers && result.detected_triggers.length > 0 ? (
              result.detected_triggers.map((trigger, idx) => (
                <span key={idx} className="trigger-chip active">
                  "{trigger}"
                </span>
              ))
            ) : (
              <span className="trigger-chip empty">None flagged in lexicon</span>
            )}
          </div>
        </div>

        <div className="breakdown-card">
          <div className="breakdown-card-title">
            <Activity size={14} className="text-accent" />
            <span>SMS Message Stats</span>
          </div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-num">{result.stats?.words ?? 0}</span>
              <span className="stat-sub">Words</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{result.stats?.characters ?? 0}</span>
              <span className="stat-sub">Characters</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{result.stats?.uppercase_ratio ?? 0}%</span>
              <span className="stat-sub">Caps Ratio</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{result.stats?.digits ?? 0}</span>
              <span className="stat-sub">Digits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
