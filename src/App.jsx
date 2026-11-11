import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SampleMessages from './components/SampleMessages';
import MessageInput from './components/MessageInput';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';
import ErrorAlert from './components/ErrorAlert';
import { checkBackendHealth, fetchSampleMessages, classifyMessage } from './services/api';
import { Shield, Sparkles, Activity } from './components/Icons';

export default function App() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [samples, setSamples] = useState([]);
  const [backendStatus, setBackendStatus] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('shieldsms_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Check health and load samples
  const fetchHealthAndSamples = useCallback(async () => {
    try {
      const healthData = await checkBackendHealth();
      setBackendStatus(healthData);
    } catch {
      setBackendStatus({ status: 'offline', error: 'Backend unreachable' });
    }

    try {
      const samplesData = await fetchSampleMessages();
      if (samplesData?.samples) {
        setSamples(samplesData.samples);
      }
    } catch {
      // Fallback local samples if API sample fetch encounters network delay
      setSamples([
        {
          id: 's-1',
          category: 'spam',
          title: 'Lottery Win',
          text: 'Congratulations! You have won a $1,000 Walmart Gift Card. Call 0800-123-456 now to claim your code. T&Cs apply.',
        },
        {
          id: 's-2',
          category: 'spam',
          title: 'Urgent Bank Alert',
          text: 'URGENT: Your bank account has been temporarily suspended due to unusual activity. Verify now at http://secure-verify.net to restore access.',
        },
        {
          id: 's-3',
          category: 'ham',
          title: 'Coffee Catch-up',
          text: 'Hey, are we still meeting up for coffee around 4:30 PM today? Let me know if that time still works for you.',
        },
        {
          id: 's-4',
          category: 'ham',
          title: 'Package Delivery',
          text: 'Hi Alex, your delivery package was left by the front porch next to the planter. Have a great evening!',
        },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchHealthAndSamples();
  }, [fetchHealthAndSamples]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('shieldsms_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Run classification
  const handleClassify = async (overrideText) => {
    const textToClassify = typeof overrideText === 'string' ? overrideText : message;
    if (!textToClassify.trim()) {
      setError('Please enter an SMS message text to inspect.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await classifyMessage(textToClassify);
      setResult(data);

      // Add to session history
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const historyEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        message: textToClassify.trim(),
        prediction: data.prediction,
        label: data.label,
        is_spam: data.is_spam,
        confidence: data.confidence,
        probabilities: data.probabilities,
        stats: data.stats,
        detected_triggers: data.detected_triggers,
        timestamp: timeStr,
      };

      setHistory((prev) => [historyEntry, ...prev.slice(0, 19)]);
    } catch (err) {
      setError(err.message || 'Classification failed. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sampleText) => {
    setMessage(sampleText);
    handleClassify(sampleText);
  };

  const handleSelectHistoryItem = (item) => {
    setMessage(item.message);
    setResult(item);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('shieldsms_history');
    } catch {
      // ignore
    }
  };

  return (
    <div className="app-layout">
      {/* Ambient background glows */}
      <div className="ambient-glow glow-top-left"></div>
      <div className="ambient-glow glow-bottom-right"></div>

      <Header
        backendStatus={backendStatus}
        onRefreshStatus={fetchHealthAndSamples}
      />

      <main className="main-content">
        <div className="content-container">
          {/* Hero Banner Intro */}
          <section className="hero-section">
            <div className="hero-badge">
              <Sparkles size={14} className="text-accent" />
              <span>Machine Learning SMS Intelligence</span>
            </div>
            <h2 className="hero-title">
              Detect Spam & Scam Texts <span className="gradient-text">Instantly</span>
            </h2>
            <p className="hero-desc">
              Powered by your pre-trained Scikit-Learn TF-IDF pipeline and Multinomial Naive Bayes model. 
              Real-time inference with probability scoring, token highlighting, and text metrics.
            </p>
          </section>

          {/* Quick Presets */}
          <SampleMessages
            samples={samples}
            onSelectSample={handleSelectSample}
            disabled={isLoading}
          />

          {/* Main Inspection Area: Split or Stacked responsive grid */}
          <div className="workspace-grid">
            <div className="workspace-left">
              <MessageInput
                message={message}
                onChangeMessage={(val) => {
                  setMessage(val);
                  if (error) setError(null);
                }}
                onSubmit={() => handleClassify(message)}
                isLoading={isLoading}
                onClear={() => {
                  setMessage('');
                  setResult(null);
                  setError(null);
                }}
              />

              {error && (
                <ErrorAlert
                  message={error}
                  onRetry={() => handleClassify(message)}
                />
              )}
            </div>

            <div className="workspace-right">
              <ResultCard
                result={result}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>

          {/* Bottom Grid: History & Model Architecture Specs */}
          <div className="bottom-grid">
            <div className="model-specs-card">
              <div className="specs-header">
                <Activity size={18} className="text-accent" />
                <h3 className="specs-title">Model Specifications</h3>
              </div>
              <div className="specs-list">
                <div className="spec-item">
                  <span className="spec-name">Classifier</span>
                  <span className="spec-val">Multinomial Naive Bayes</span>
                </div>
                <div className="spec-item">
                  <span className="spec-name">Feature Extraction</span>
                  <span className="spec-val">TF-IDF Vectorizer (n-gram)</span>
                </div>
                <div className="spec-item">
                  <span className="spec-name">Artifact File</span>
                  <span className="spec-val code-val">spam_model.pkl</span>
                </div>
                <div className="spec-item">
                  <span className="spec-name">Inference Latency</span>
                  <span className="spec-val">&lt; 15 ms</span>
                </div>
                <div className="spec-item">
                  <span className="spec-name">Classes</span>
                  <span className="spec-val tag-classes">['ham', 'spam']</span>
                </div>
              </div>
            </div>

            <HistoryList
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </main>

      <footer className="footer-bar">
        <div className="footer-inner">
          <p className="footer-text">
            ShieldSMS &copy; {new Date().getFullYear()} &mdash; Python Flask REST API &bull; Scikit-Learn Pipeline &bull; React Vite Frontend
          </p>
          <div className="footer-status-pill">
            <span className={`status-micro-dot ${backendStatus?.status === 'healthy' ? 'online' : 'offline'}`}></span>
            <span>REST API: Port 5001</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
