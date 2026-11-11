import React, { useRef } from 'react';
import { Send, Trash2, Copy, Sparkles } from './Icons';

export default function MessageInput({
  message,
  onChangeMessage,
  onSubmit,
  isLoading,
  onClear,
}) {
  const textareaRef = useRef(null);

  const charCount = message.length;
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;
  const uppercaseCount = (message.match(/[A-Z]/g) || []).length;
  const uppercaseRatio = charCount > 0 ? Math.round((uppercaseCount / charCount) * 100) : 0;

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && message.trim()) {
        onSubmit();
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeMessage(text);
        if (textareaRef.current) textareaRef.current.focus();
      }
    } catch {
      // Fallback: clipboard access denied or not allowed in browser
    }
  };

  return (
    <div className="input-card">
      <div className="input-card-header">
        <div className="input-label-group">
          <label htmlFor="sms-input" className="input-title">
            SMS Message Inspector
          </label>
          <span className="input-hint">Paste or type the SMS text below</span>
        </div>

        <div className="input-actions-bar">
          <button
            type="button"
            className="action-btn-text"
            onClick={handlePaste}
            disabled={isLoading}
            title="Paste from clipboard"
          >
            <Copy size={14} />
            <span>Paste</span>
          </button>
          {message && (
            <button
              type="button"
              className="action-btn-text text-muted-hover"
              onClick={onClear}
              disabled={isLoading}
              title="Clear input"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="textarea-wrapper">
        <textarea
          id="sms-input"
          ref={textareaRef}
          className="sms-textarea"
          rows={5}
          placeholder="e.g. 'URGENT! You have won a £1,000 cash prize. Reply CLAIM to 88010 now to receive your payout!'"
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={1000}
        />

        {/* Live scanning overlay when classifying */}
        {isLoading && (
          <div className="scanning-overlay">
            <div className="scanner-line"></div>
            <div className="scanner-glow"></div>
            <span className="scanner-text">AI Model Analyzing SMS Tokens...</span>
          </div>
        )}
      </div>

      <div className="input-footer">
        <div className="metrics-preview">
          <span className="stat-pill">
            <strong>{charCount}</strong> chars
          </span>
          <span className="stat-pill">
            <strong>{wordCount}</strong> words
          </span>
          {uppercaseRatio > 25 && (
            <span className="stat-pill stat-pill-warning" title="High capital letters ratio is common in spam">
              <strong>{uppercaseRatio}%</strong> CAPS
            </span>
          )}
        </div>

        <div className="submit-group">
          <span className="shortcut-tip">Press Ctrl+Enter</span>
          <button
            id="check-message-btn"
            type="button"
            className={`btn-primary ${isLoading ? 'btn-loading' : ''}`}
            onClick={onSubmit}
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                <span>Analyzing Model...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Check Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
