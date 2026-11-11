import React from 'react';
import { AlertCircle, RefreshCw } from './Icons';

export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-alert">
      <div className="error-alert-left">
        <AlertCircle className="error-icon" size={20} />
        <div>
          <h4 className="error-title">Classification Error</h4>
          <p className="error-desc">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button type="button" className="error-retry-btn" onClick={onRetry}>
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
