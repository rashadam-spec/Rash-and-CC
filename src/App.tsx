import { useState, useCallback } from 'react';
import type { UseCase } from './types';
import { loadUseCases, saveUseCases } from './storage';
import { applyScoring, CATEGORY_META } from './scoring';
import UseCaseForm from './components/UseCaseForm';
import RankedList from './components/RankedList';
import QuadrantChart from './components/QuadrantChart';

function exportCSV(cases: UseCase[]) {
  const sorted = [...cases].sort((a, b) => b.compositeScore - a.compositeScore);
  const headers = [
    'Rank', 'Name', 'Business Unit', 'Score', 'Category',
    'Strategic Alignment', 'Delivery Complexity', 'Data Availability',
    'Risk & Compliance', 'Stakeholder Support', 'Description',
  ];
  const rows = sorted.map((uc, i) => [
    i + 1,
    `"${uc.name.replace(/"/g, '""')}"`,
    `"${uc.businessUnit.replace(/"/g, '""')}"`,
    uc.compositeScore,
    CATEGORY_META[uc.category].label,
    uc.scores.strategicAlignment,
    uc.scores.deliveryComplexity,
    uc.scores.dataAvailability,
    uc.scores.riskCompliance,
    uc.scores.stakeholderSupport,
    `"${uc.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ai-use-case-matrix.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [useCases, setUseCases] = useState<UseCase[]>(loadUseCases);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<UseCase | null>(null);

  const sorted = [...useCases].sort((a, b) => b.compositeScore - a.compositeScore);

  const counts = {
    'quick-win':     useCases.filter(u => u.category === 'quick-win').length,
    'strategic-bet': useCases.filter(u => u.category === 'strategic-bet').length,
    'consider':      useCases.filter(u => u.category === 'consider').length,
    'reconsider':    useCases.filter(u => u.category === 'reconsider').length,
  };

  const handleSave = useCallback((partial: Omit<UseCase, 'compositeScore' | 'category'>) => {
    const scored = applyScoring(partial);
    setUseCases(prev => {
      const next = editingCase
        ? prev.map(u => u.id === scored.id ? scored : u)
        : [...prev, scored];
      saveUseCases(next);
      return next;
    });
    setSelectedId(scored.id);
    setFormOpen(false);
    setEditingCase(null);
  }, [editingCase]);

  const handleEdit = useCallback((uc: UseCase) => {
    setEditingCase(uc);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setUseCases(prev => {
      const next = prev.filter(u => u.id !== id);
      saveUseCases(next);
      return next;
    });
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <h1>AI Use-Case Prioritisation Matrix</h1>
          <p>Score and rank AI initiatives across value, effort, data, risk, and stakeholder support.</p>
        </div>
        <div className="header-actions">
          {useCases.length > 0 && (
            <button className="btn btn-outline" onClick={() => exportCSV(useCases)}>
              Export CSV
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setEditingCase(null); setFormOpen(true); }}>
            + Add Use Case
          </button>
        </div>
      </header>

      <div className="stats-bar">
        {(Object.entries(counts) as [keyof typeof counts, number][]).map(([cat, n]) => (
          <div
            key={cat}
            className="stat-pill"
            style={{ color: CATEGORY_META[cat].color, background: CATEGORY_META[cat].bg }}
          >
            <span className="stat-num">{n}</span>
            <span className="stat-label">{CATEGORY_META[cat].label}</span>
          </div>
        ))}
        <div className="stat-pill stat-total">
          <span className="stat-num">{useCases.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <main className="app-main">
        <section className="panel list-panel">
          <div className="panel-heading">Ranked Use Cases</div>
          <RankedList
            useCases={sorted}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>

        <section className="panel chart-panel">
          <div className="panel-heading">Priority Quadrant</div>
          <QuadrantChart
            useCases={useCases}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
      </main>

      {formOpen && (
        <UseCaseForm
          initial={editingCase}
          onSave={handleSave}
          onCancel={() => { setFormOpen(false); setEditingCase(null); }}
        />
      )}
    </div>
  );
}
