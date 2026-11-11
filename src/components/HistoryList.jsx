import React from 'react';
import { MessageSquare, Trash2, ArrowRight } from './Icons';

export default function HistoryList({ history, onSelectHistoryItem, onClearHistory }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="history-container">
      <div className="history-header">
        <div className="history-title-group">
          <MessageSquare size={16} className="text-accent" />
          <span className="history-title">Recent Scans ({history.length})</span>
        </div>
        <button
          type="button"
          className="history-clear-btn"
          onClick={onClearHistory}
          title="Clear scan history"
        >
          <Trash2 size={13} />
          <span>Clear History</span>
        </button>
      </div>

      <div className="history-list">
        {history.map((item) => {
          const isSpam = item.is_spam;
          return (
            <div
              key={item.id}
              className={`history-card ${isSpam ? 'history-card-spam' : 'history-card-ham'}`}
              onClick={() => onSelectHistoryItem(item)}
              role="button"
              tabIndex={0}
              title="Click to view full inspection"
            >
              <div className="history-card-top">
                <span className={`history-pill ${isSpam ? 'pill-spam' : 'pill-ham'}`}>
                  {isSpam ? 'SPAM' : 'HAM'}
                </span>
                <span className="history-confidence">{item.confidence}%</span>
                <span className="history-time">{item.timestamp}</span>
              </div>
              <p className="history-text-preview">{item.message}</p>
              <div className="history-card-bottom">
                <span className="history-open-hint">
                  Re-inspect <ArrowRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
