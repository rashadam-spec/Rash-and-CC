import { useState } from 'react';
import type { UseCase } from '../types';
import { CATEGORY_META, DIMENSIONS } from '../scoring';

interface Props {
  useCases: UseCase[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (uc: UseCase) => void;
  onDelete: (id: string) => void;
}

export default function RankedList({ useCases, selectedId, onSelect, onEdit, onDelete }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (useCases.length === 0) {
    return (
      <div className="empty-state">
        <p>No use cases yet.</p>
        <p>Click <strong>+ Add Use Case</strong> to get started.</p>
      </div>
    );
  }

  return (
    <div className="ranked-list">
      {useCases.map((uc, i) => {
        const meta = CATEGORY_META[uc.category];
        const isSelected = uc.id === selectedId;
        const isExpanded = uc.id === expandedId;

        return (
          <div
            key={uc.id}
            className={`list-item${isSelected ? ' selected' : ''}`}
            onClick={() => {
              onSelect(uc.id);
              setExpandedId(isExpanded ? null : uc.id);
            }}
          >
            <div className="list-item-main">
              <span className="rank">#{i + 1}</span>
              <div className="list-item-info">
                <div className="list-item-name">{uc.name}</div>
                {uc.businessUnit && <div className="list-item-unit">{uc.businessUnit}</div>}
              </div>
              <div className="list-item-score-wrap">
                <div className="score-value">{uc.compositeScore}</div>
                <div className="score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${uc.compositeScore}%`, background: meta.color }}
                  />
                </div>
              </div>
              <span
                className="category-badge"
                style={{ color: meta.color, background: meta.bg }}
              >
                {meta.label}
              </span>
              <div className="list-item-actions" onClick={e => e.stopPropagation()}>
                <button className="icon-btn" title="Edit" onClick={() => onEdit(uc)}>✏️</button>
                <button
                  className="icon-btn"
                  title="Delete"
                  onClick={() => {
                    if (confirm(`Delete "${uc.name}"?`)) onDelete(uc.id);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="list-item-detail">
                {uc.description && <p className="detail-desc">{uc.description}</p>}
                <div className="dimension-scores">
                  {DIMENSIONS.map(dim => (
                    <div key={dim.key} className="dim-row">
                      <span className="dim-label">{dim.label}</span>
                      <div className="dim-pips">
                        {[1, 2, 3, 4, 5].map(n => (
                          <span
                            key={n}
                            className={`pip${n <= uc.scores[dim.key] ? ' active' : ''}${dim.inverted ? ' inv' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="dim-val">{uc.scores[dim.key]}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
