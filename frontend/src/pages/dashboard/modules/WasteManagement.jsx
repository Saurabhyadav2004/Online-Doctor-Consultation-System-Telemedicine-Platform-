import React, { useState } from 'react';
import styles from './Module.module.css';

const WASTE_CATEGORIES = [
  { id: 'sharps', icon: '💉', label: 'Sharps Waste', color: '#e74c3c', desc: 'Needles, syringes, lancets', disposal: 'Use a puncture-resistant sharps container. Never recap needles. Take to a pharmacy or sharps disposal site.' },
  { id: 'pharmaceutical', icon: '💊', label: 'Pharmaceutical', color: '#9b59b6', desc: 'Expired medicines, unused drugs', disposal: 'Return to pharmacy take-back programs. Never flush down the drain. Check for local medication disposal events.' },
  { id: 'infectious', icon: '🦠', label: 'Infectious Waste', color: '#e67e22', desc: 'Wound dressings, contaminated materials', disposal: 'Double-bag in biohazard bags. Seal tightly. Contact your local healthcare facility for proper disposal.' },
  { id: 'chemical', icon: '⚗️', label: 'Chemical Waste', color: '#2980b9', desc: 'Disinfectants, reagents, solvents', disposal: 'Never pour down drain. Contact hazardous waste disposal service. Store in clearly labelled original containers.' },
  { id: 'pathological', icon: '🧬', label: 'Pathological Waste', color: '#8e44ad', desc: 'Tissues, organs, body fluids', disposal: 'Must be handled by licensed medical waste disposal facilities only. Contact your healthcare provider.' },
  { id: 'radioactive', icon: '☢️', label: 'Radioactive Waste', color: '#f39c12', desc: 'Radiopharmaceuticals, contaminated items', disposal: 'Handle only under supervision of radiation safety officer. Store in lead-lined containers away from people.' },
  { id: 'general', icon: '🗑️', label: 'General Clinical Waste', color: '#7f8c8d', desc: 'Non-hazardous clinical waste', disposal: 'Separate from hazardous waste. Use yellow waste bags. Arrange collection with licensed waste contractor.' },
];

const TIPS = [
  { icon: '♻️', title: 'Segregate at Source', desc: 'Separate waste at the point of generation — never mix hazardous and non-hazardous waste.' },
  { icon: '🏷️', title: 'Label Everything', desc: 'Clearly label all waste containers with type, date, and hazard level.' },
  { icon: '📋', title: 'Track & Record', desc: 'Maintain waste manifests for regulatory compliance and auditing.' },
  { icon: '🧤', title: 'PPE Always', desc: 'Use appropriate PPE when handling any medical waste — gloves, masks, eye protection.' },
  { icon: '📚', title: 'Staff Training', desc: 'Ensure all staff are trained on waste segregation and disposal protocols.' },
  { icon: '🌍', title: 'Minimise Waste', desc: 'Buy only what you need, use reusables where safe, and avoid over-packaging.' },
];

export default function WasteManagement() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [log, setLog] = useState([]);
  const [logForm, setLogForm] = useState({ category: '', quantity: '', unit: 'kg', notes: '', date: new Date().toISOString().split('T')[0] });
  const [showLog, setShowLog] = useState(false);

  const handleLogChange = e => setLogForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const addLog = e => {
    e.preventDefault();
    if (!logForm.category || !logForm.quantity) return;
    setLog(p => [{ ...logForm, id: Date.now(), timestamp: new Date().toLocaleString() }, ...p]);
    setLogForm({ category: '', quantity: '', unit: 'kg', notes: '', date: new Date().toISOString().split('T')[0] });
    setShowLog(false);
  };

  const totalByCategory = WASTE_CATEGORIES.map(c => ({
    ...c,
    total: log.filter(l => l.category === c.id).reduce((sum, l) => sum + parseFloat(l.quantity || 0), 0)
  })).filter(c => c.total > 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Waste Management</h1>
          <p className="page-subtitle">Medical waste segregation, disposal guidance, and tracking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowLog(p => !p)}>
          {showLog ? '✕ Cancel' : '+ Log Waste'}
        </button>
      </div>

      {showLog && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Log Waste Disposal</h3>
          <form onSubmit={addLog} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Waste Category</label>
                <select name="category" value={logForm.category} onChange={handleLogChange} required>
                  <option value="">Select category…</option>
                  {WASTE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" name="date" value={logForm.date} onChange={handleLogChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input type="number" step="0.01" name="quantity" value={logForm.quantity} onChange={handleLogChange} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select name="unit" value={logForm.unit} onChange={handleLogChange}>
                  <option value="kg">kg</option>
                  <option value="L">Litres</option>
                  <option value="units">Units</option>
                  <option value="bags">Bags</option>
                  <option value="containers">Containers</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notes</label>
                <input name="notes" value={logForm.notes} onChange={handleLogChange} placeholder="Collection method, contractor, special handling…" />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowLog(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Log Entry</button>
            </div>
          </form>
        </div>
      )}

      {/* Waste summary if logs exist */}
      {totalByCategory.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>📊 Waste Summary (This Session)</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {totalByCategory.map(c => (
              <div key={c.id} style={{ background: `${c.color}14`, border: `1px solid ${c.color}30`, borderRadius: 'var(--radius-sm)', padding: '0.65rem 1rem', minWidth: 130 }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{c.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: c.color }}>{c.total.toFixed(2)} mixed units</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waste Categories Guide */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.85rem' }}>🗂️ Waste Categories & Disposal Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.85rem' }}>
          {WASTE_CATEGORIES.map(cat => (
            <div
              key={cat.id}
              className="card"
              style={{ padding: '1.1rem', cursor: 'pointer', borderLeft: `3px solid ${cat.color}`, transition: 'all 0.15s', boxShadow: selectedCategory === cat.id ? 'var(--shadow-lg)' : undefined }}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: cat.color }}>{cat.label}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{cat.desc}</div>
              {selectedCategory === cat.id && (
                <div style={{ background: `${cat.color}0d`, borderRadius: 'var(--radius-sm)', padding: '0.7rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.25rem' }}>
                  <strong>Disposal Method:</strong><br />{cat.disposal}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: cat.color, marginTop: '0.35rem' }}>
                {selectedCategory === cat.id ? '▲ Hide disposal guide' : '▼ Show disposal guide'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practice Tips */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.85rem' }}>✅ Best Practice Guidelines</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {TIPS.map(t => (
            <div key={t.title} className="card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{t.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{t.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waste log history */}
      {log.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.85rem' }}>📋 Disposal Log</h3>
          <div className={styles.cardList}>
            {log.map(entry => {
              const cat = WASTE_CATEGORIES.find(c => c.id === entry.category);
              return (
                <div key={entry.id} className={`card ${styles.itemCard}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{cat?.icon}</span>
                    <div>
                      <div className={styles.itemTitle}>{cat?.label}</div>
                      <div className={styles.itemMeta}>{entry.date} · {entry.quantity} {entry.unit}</div>
                    </div>
                  </div>
                  {entry.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1, textAlign: 'right' }}>{entry.notes}</div>}
                  <button className="btn btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--danger)' }} onClick={() => setLog(p => p.filter(l => l.id !== entry.id))}>Remove</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
