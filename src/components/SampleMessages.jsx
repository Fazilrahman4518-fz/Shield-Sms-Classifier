import React from 'react';
import { Sparkles, ShieldAlert, ShieldCheck } from './Icons';

export default function SampleMessages({ samples, onSelectSample, disabled }) {
  if (!samples || samples.length === 0) return null;

  const spamSamples = samples.filter(s => s.category === 'spam');
  const hamSamples = samples.filter(s => s.category === 'ham');

  return (
    <div className="samples-container">
      <div className="samples-header">
        <Sparkles size={16} className="text-accent" />
        <span className="samples-title">Try Quick Samples</span>
        <span className="samples-hint">(Click to load & test)</span>
      </div>

      <div className="samples-groups">
        <div className="sample-column">
          <div className="sample-category-label text-danger">
            <ShieldAlert size={14} />
            <span>Spam & Phishing Examples</span>
          </div>
          <div className="sample-chips-row">
            {spamSamples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className="sample-chip sample-chip-spam"
                disabled={disabled}
                onClick={() => onSelectSample(sample.text)}
                title={sample.text}
              >
                <span className="sample-tag-dot red"></span>
                <span className="sample-chip-title">{sample.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sample-column">
          <div className="sample-category-label text-success">
            <ShieldCheck size={14} />
            <span>Legitimate (Ham) Examples</span>
          </div>
          <div className="sample-chips-row">
            {hamSamples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className="sample-chip sample-chip-ham"
                disabled={disabled}
                onClick={() => onSelectSample(sample.text)}
                title={sample.text}
              >
                <span className="sample-tag-dot green"></span>
                <span className="sample-chip-title">{sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
