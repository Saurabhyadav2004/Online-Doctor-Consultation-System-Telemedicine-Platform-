import React, { useState, useEffect } from 'react';
import { recordsAPI, vitalsAPI, medicationsAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './Module.module.css';

const RECORD_TYPES = [
  { value: 'diagnosis', label: '🩺 Diagnosis' },
  { value: 'lab-result', label: '🧪 Lab Result' },
  { value: 'imaging', label: '🫁 Imaging' },
  { value: 'procedure', label: '⚕️ Procedure' },
  { value: 'vaccination', label: '💉 Vaccination' },
  { value: 'allergy', label: '⚠️ Allergy' },
  { value: 'surgery', label: '🔪 Surgery' },
];

const TYPE_ICONS = {
  'diagnosis': '🩺', 'lab-result': '🧪', 'imaging': '🫁',
  'procedure': '⚕️', 'vaccination': '💉', 'allergy': '⚠️',
  'surgery': '🔪', 'maternal': '🤱'
};

export default function EHRSystem() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('records');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', date: '', type: 'diagnosis', icdCode: '', isConfidential: false
  });

  const load = async () => {
    setLoading(true);
    try {
      const [recRes, vitRes, medRes] = await Promise.all([
        recordsAPI.getAll(),
        vitalsAPI.getAll({ limit: 10 }),
        medicationsAPI.getAll()
      ]);
      setRecords(recRes.data.data.records || []);
      setVitals(vitRes.data.data.vitals || []);
      setMedications(medRes.data.data.medications || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await recordsAPI.create(form);
      setShowForm(false);
      setForm({ title: '', description: '', date: '', type: 'diagnosis', icdCode: '', isConfidential: false });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save record'); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { await recordsAPI.delete(id); load(); } catch {}
  };

  const filteredRecords = typeFilter === 'all' ? records : records.filter(r => r.type === typeFilter);

  const TABS = [
    { id: 'records', label: `📋 Records (${records.length})` },
    { id: 'vitals', label: `📊 Vitals (${vitals.length})` },
    { id: 'medications', label: `💊 Medications (${medications.length})` },
    { id: 'summary', label: '📄 Summary' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">EHR System</h1>
          <p className="page-subtitle">Electronic health records, vitals history, and medical summary</p>
        </div>
        {activeTab === 'records' && (
          <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
            {showForm ? '✕ Cancel' : '+ Add Record'}
          </button>
        )}
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {showForm && activeTab === 'records' && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Add Health Record</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Record Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  {RECORD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Type 2 Diabetes Diagnosis" required />
              </div>
              <div className="form-group">
                <label className="form-label">ICD Code (optional)</label>
                <input name="icdCode" value={form.icdCode} onChange={handleChange} placeholder="e.g. E11.9" />
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.4rem' }}>
                  <input type="checkbox" name="isConfidential" checked={form.isConfidential} onChange={handleChange} style={{ width: 'auto' }} />
                  <span className="form-label" style={{ margin: 0 }}>Mark as Confidential</span>
                </label>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description / Details</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Clinical details, findings, results…" required />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingCenter}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : (
        <>
          {activeTab === 'records' && (
            <>
              <div className={styles.filters}>
                <button className={`${styles.filterBtn} ${typeFilter === 'all' ? styles.active : ''}`} onClick={() => setTypeFilter('all')}>All</button>
                {RECORD_TYPES.map(t => (
                  <button key={t.value} className={`${styles.filterBtn} ${typeFilter === t.value ? styles.active : ''}`} onClick={() => setTypeFilter(t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
              {filteredRecords.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No records found</h3><p>Add your first health record above</p></div>
              ) : (
                <div className={styles.cardList}>
                  {filteredRecords.map(r => (
                    <div key={r._id} className={`card ${styles.itemCard}`} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0' }}
                        onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.3rem' }}>{TYPE_ICONS[r.type] || '📄'}</span>
                          <div>
                            <div className={styles.itemTitle}>{r.title}</div>
                            <div className={styles.itemMeta}>
                              {new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              {r.icdCode && ` · ICD: ${r.icdCode}`}
                              {r.doctor && ` · Dr. ${r.doctor.name}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {r.isConfidential && <span className="badge badge-warning">🔒 Confidential</span>}
                          <span className="badge badge-muted">{r.type}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{expandedId === r._id ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      {expandedId === r._id && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{r.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" style={{ fontSize: '0.78rem', color: 'var(--danger)' }} onClick={() => handleDelete(r._id)}>Delete Record</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'vitals' && (
            vitals.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No vitals recorded</h3><p>Record vitals in Disease Management</p></div>
            ) : (
              <div className={styles.cardList}>
                {vitals.map(v => (
                  <div key={v._id} className={`card ${styles.itemCard}`}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitle}>
                        {new Date(v.recordedAt).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {v.heartRate && <span style={{ fontSize: '0.82rem' }}>❤️ {v.heartRate} bpm</span>}
                        {v.bloodPressure?.systolic && <span style={{ fontSize: '0.82rem' }}>🩸 {v.bloodPressure.systolic}/{v.bloodPressure.diastolic} mmHg</span>}
                        {v.temperature && <span style={{ fontSize: '0.82rem' }}>🌡️ {v.temperature}°C</span>}
                        {v.oxygenSaturation && <span style={{ fontSize: '0.82rem' }}>🫁 {v.oxygenSaturation}%</span>}
                        {v.weight && <span style={{ fontSize: '0.82rem' }}>⚖️ {v.weight} kg</span>}
                        {v.bmi && <span style={{ fontSize: '0.82rem' }}>📏 BMI {v.bmi}</span>}
                        {v.bloodGlucose && <span style={{ fontSize: '0.82rem' }}>🩸 {v.bloodGlucose} mg/dL</span>}
                      </div>
                    </div>
                    {v.recordedBy && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {v.recordedBy.name}</div>}
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'medications' && (
            medications.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">💊</div><h3>No medications on file</h3></div>
            ) : (
              <div className={styles.cardList}>
                {medications.map(m => (
                  <div key={m._id} className={`card ${styles.itemCard}`}>
                    <div className={styles.itemInfo}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <div className={styles.itemTitle}>💊 {m.name}</div>
                        <span className={`badge ${m.isActive ? 'badge-success' : 'badge-muted'}`}>{m.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className={styles.itemMeta}>{m.dosage} · {m.frequency} · {m.route} {m.indication ? `· ${m.indication}` : ''}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Started: {new Date(m.startDate).toLocaleDateString()}
                        {m.endDate && ` · Ends: ${new Date(m.endDate).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '1rem' }}>👤 Patient Summary</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}><div className={styles.detailLabel}>Name</div><div className={styles.detailValue}>{user.name}</div></div>
                  <div className={styles.detailItem}><div className={styles.detailLabel}>Email</div><div className={styles.detailValue}>{user.email}</div></div>
                  <div className={styles.detailItem}><div className={styles.detailLabel}>Role</div><div className={styles.detailValue} style={{ textTransform: 'capitalize' }}>{user.role}</div></div>
                  {user.dateOfBirth && <div className={styles.detailItem}><div className={styles.detailLabel}>Date of Birth</div><div className={styles.detailValue}>{new Date(user.dateOfBirth).toLocaleDateString()}</div></div>}
                  {user.bloodGroup && <div className={styles.detailItem}><div className={styles.detailLabel}>Blood Group</div><div className={styles.detailValue}>{user.bloodGroup}</div></div>}
                  {user.phone && <div className={styles.detailItem}><div className={styles.detailLabel}>Phone</div><div className={styles.detailValue}>{user.phone}</div></div>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {[
                  { icon: '📋', label: 'Total Records', value: records.length, color: 'var(--primary)' },
                  { icon: '💊', label: 'Active Medications', value: medications.filter(m => m.isActive).length, color: '#8b4513' },
                  { icon: '📊', label: 'Vital Readings', value: vitals.length, color: '#e74c3c' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: '1.25rem', borderLeft: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{s.icon}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {vitals[0] && (
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '1rem' }}>📊 Latest Vitals</h3>
                  <div className={styles.detailGrid}>
                    {vitals[0].heartRate && <div className={styles.detailItem}><div className={styles.detailLabel}>Heart Rate</div><div className={styles.detailValue}>{vitals[0].heartRate} bpm</div></div>}
                    {vitals[0].bloodPressure?.systolic && <div className={styles.detailItem}><div className={styles.detailLabel}>Blood Pressure</div><div className={styles.detailValue}>{vitals[0].bloodPressure.systolic}/{vitals[0].bloodPressure.diastolic} mmHg</div></div>}
                    {vitals[0].temperature && <div className={styles.detailItem}><div className={styles.detailLabel}>Temperature</div><div className={styles.detailValue}>{vitals[0].temperature}°C</div></div>}
                    {vitals[0].oxygenSaturation && <div className={styles.detailItem}><div className={styles.detailLabel}>O₂ Saturation</div><div className={styles.detailValue}>{vitals[0].oxygenSaturation}%</div></div>}
                    {vitals[0].bmi && <div className={styles.detailItem}><div className={styles.detailLabel}>BMI</div><div className={styles.detailValue}>{vitals[0].bmi}</div></div>}
                    {vitals[0].bloodGlucose && <div className={styles.detailItem}><div className={styles.detailLabel}>Blood Glucose</div><div className={styles.detailValue}>{vitals[0].bloodGlucose} mg/dL</div></div>}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
