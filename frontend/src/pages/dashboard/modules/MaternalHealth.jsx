import React, { useState, useEffect } from 'react';
import { recordsAPI } from '../../../lib/api';
import styles from './Module.module.css';

export default function MaternalHealth() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', date: '', type: 'maternal',
    maternalData: { gestationalWeek: '', fetalHeartRate: '', fundalHeight: '', presentation: '', nextVisit: '' }
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await recordsAPI.getAll({ type: 'maternal' });
      setRecords(res.data.data.records || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleMaternalChange = e => setForm(p => ({ ...p, maternalData: { ...p.maternalData, [e.target.name]: e.target.value } }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await recordsAPI.create(form);
      setShowForm(false);
      setForm({ title: '', description: '', date: '', type: 'maternal', maternalData: { gestationalWeek: '', fetalHeartRate: '', fundalHeight: '', presentation: '', nextVisit: '' } });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save record'); }
    setSubmitting(false);
  };

  const MILESTONES = [
    { week: '4-8', label: 'Confirmation', desc: 'Pregnancy confirmed, first prenatal visit' },
    { week: '10-13', label: 'First Trimester Screen', desc: 'Nuchal translucency, blood tests' },
    { week: '18-22', label: 'Anatomy Scan', desc: 'Detailed ultrasound of baby' },
    { week: '24-28', label: 'Glucose Test', desc: 'Gestational diabetes screening' },
    { week: '36-40', label: 'Final Checks', desc: 'Presentation, birth planning' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Maternal Health</h1>
          <p className="page-subtitle">Pregnancy care, antenatal visits, and maternal monitoring</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
          {showForm ? '✕ Cancel' : '+ Add Visit Record'}
        </button>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Pregnancy timeline */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' }}>🤰 Pregnancy Milestones</h3>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {MILESTONES.map(m => (
            <div key={m.week} style={{ minWidth: 140, background: 'var(--secondary)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', flexShrink: 0 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>WEEK {m.week}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>{m.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Record Antenatal Visit</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Visit Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. 20-week anatomy scan" required />
              </div>
              <div className="form-group">
                <label className="form-label">Visit Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gestational Week</label>
                <input type="number" name="gestationalWeek" value={form.maternalData.gestationalWeek} onChange={handleMaternalChange} placeholder="e.g. 20" min={1} max={42} />
              </div>
              <div className="form-group">
                <label className="form-label">Fetal Heart Rate (bpm)</label>
                <input type="number" name="fetalHeartRate" value={form.maternalData.fetalHeartRate} onChange={handleMaternalChange} placeholder="e.g. 145" />
              </div>
              <div className="form-group">
                <label className="form-label">Fundal Height (cm)</label>
                <input type="number" name="fundalHeight" value={form.maternalData.fundalHeight} onChange={handleMaternalChange} placeholder="e.g. 20" />
              </div>
              <div className="form-group">
                <label className="form-label">Fetal Presentation</label>
                <select name="presentation" value={form.maternalData.presentation} onChange={handleMaternalChange}>
                  <option value="">Select…</option>
                  <option value="cephalic">Cephalic (Head down)</option>
                  <option value="breech">Breech</option>
                  <option value="transverse">Transverse</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Next Visit Date</label>
                <input type="date" name="nextVisit" value={form.maternalData.nextVisit} onChange={handleMaternalChange} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Clinical Notes</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Notes from the visit…" required />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <span className="spinner" /> : 'Save Visit'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingCenter}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : records.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🤱</div><h3>No maternal records yet</h3><p>Start tracking your pregnancy journey above</p></div>
      ) : (
        <div className={styles.cardList}>
          {records.map(r => (
            <div key={r._id} className={`card ${styles.itemCard}`} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                <div>
                  <div className={styles.itemTitle}>{r.title}</div>
                  <div className={styles.itemMeta}>{new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                {r.maternalData?.gestationalWeek && (
                  <span className="badge badge-primary">Week {r.maternalData.gestationalWeek}</span>
                )}
              </div>
              {r.maternalData && (
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {r.maternalData.fetalHeartRate && <span style={{ fontSize: '0.82rem' }}>💓 FHR: {r.maternalData.fetalHeartRate} bpm</span>}
                  {r.maternalData.fundalHeight && <span style={{ fontSize: '0.82rem' }}>📏 FH: {r.maternalData.fundalHeight} cm</span>}
                  {r.maternalData.presentation && <span style={{ fontSize: '0.82rem' }}>👶 {r.maternalData.presentation}</span>}
                  {r.maternalData.nextVisit && <span style={{ fontSize: '0.82rem' }}>📅 Next: {new Date(r.maternalData.nextVisit).toLocaleDateString()}</span>}
                </div>
              )}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
