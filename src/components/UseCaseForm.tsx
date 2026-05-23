import { useState } from 'react';
import type { UseCase, Scores } from '../types';
import { DIMENSIONS } from '../scoring';

interface Props {
  initial: UseCase | null;
  onSave: (uc: Omit<UseCase, 'compositeScore' | 'category'>) => void;
  onCancel: () => void;
}

const DEFAULT_SCORES: Scores = {
  strategicAlignment: 3,
  deliveryComplexity: 3,
  dataAvailability: 3,
  riskCompliance: 3,
  stakeholderSupport: 3,
};

export default function UseCaseForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [businessUnit, setBusinessUnit] = useState(initial?.businessUnit ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [scores, setScores] = useState<Scores>(initial?.scores ?? DEFAULT_SCORES);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      businessUnit: businessUnit.trim(),
      description: description.trim(),
      scores,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Use Case' : 'Add Use Case'}</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="uc-name">Use Case Name <span className="required">*</span></label>
            <input
              id="uc-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Automated FOI Request Triage"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="uc-unit">Business Unit / Division</label>
            <input
              id="uc-unit"
              type="text"
              value={businessUnit}
              onChange={e => setBusinessUnit(e.target.value)}
              placeholder="e.g. Legal & Governance"
            />
          </div>

          <div className="form-group">
            <label htmlFor="uc-desc">Description</label>
            <textarea
              id="uc-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the use case and expected outcomes…"
              rows={3}
            />
          </div>

          <div className="scores-section">
            <h3>Scoring</h3>
            {DIMENSIONS.map(dim => (
              <div key={dim.key} className="score-row">
                <div className="score-row-header">
                  <span className="score-label">{dim.label}</span>
                  <span className="score-weight">{Math.round(dim.weight * 100)}% weight{dim.inverted ? ' · lower is better' : ''}</span>
                </div>
                <p className="score-desc">{dim.description}</p>
                <div className="score-input">
                  <span className="anchor-label low">{dim.lowAnchor}</span>
                  <div className="score-buttons">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        className={`score-btn ${scores[dim.key] === n ? 'active' : ''}`}
                        onClick={() => setScores(s => ({ ...s, [dim.key]: n }))}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <span className="anchor-label high">{dim.highAnchor}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              {initial ? 'Update Use Case' : 'Add Use Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
