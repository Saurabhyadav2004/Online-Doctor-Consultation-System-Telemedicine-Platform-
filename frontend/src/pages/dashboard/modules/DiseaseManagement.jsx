import React, { useState, useEffect } from 'react';
import { medicationsAPI, vitalsAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './Module.module.css';

export default function DiseaseManagement() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medications');
  const [showMedForm, setShowMedForm] = useState(false);
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: '', route: 'oral', startDate: '', indication: '', instructions: '' });
  const [vitalForm, setVitalForm] = useState({ heartRate: '', temperature: '', oxygenSaturation: '', weight: '', height: '', bloodGlucose: '', bloodPressure: { systolic: '', diastolic: '' } });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [medRes, vitalRes] = await Promise.all([medicationsAPI.getAll(), vitalsAPI.getAll()]);
      setMedications(medRes.data.data.medications || []);
      setVitals(vitalRes.data.data.vitals || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submitMed = async e => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await medicationsAPI.create(medForm);
      setShowMedForm(false);
      setMedForm({ name: '', dosage: '', frequency: '', route: 'oral', startDate: '', indication: '', instructions: '' });
      load();
    } catch (e) { setError(e.response?.data?.message || 'Failed to add medication'); }
    setSubmitting(false);
  };

  const submitVital = async e => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      const payload = { ...vitalForm, bloodPressure: { systolic: Number(vitalForm.bloodPressure.systolic), diastolic: Number(vitalForm.bloodPressure.diastolic) } };
      await vitalsAPI.create(payload);
      setShowVitalForm(false);
      setVitalForm({ heartRate: '', temperature: '', oxygenSaturation: '', weight: '', height: '', bloodGlucose: '', bloodPressure: { systolic: '', diastolic: '' } });
      load();
    } catch (e) { setError(e.response?.data?.message || 'Failed to record vitals'); }
    setSubmitting(false);
  };

  const toggleMedStatus = async (id, isActive) => {
    try { await medicationsAPI.update(id, { isActive: !isActive }); load(); } catch {}
  };

  const deleteMed = async (id) => {
    if (!confirm('Delete this medication?')) return;
    try { await medicationsAPI.delete(id); load(); } catch {}
  };

  const handleMedChange = e => setMedForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleVitalChange = e => {
    const { name, value } = e.target;
    if (name === 'systolic' || name === 'diastolic') {
      setVitalForm(p => ({ ...p, bloodPressure: { ...p.bloodPressure, [name]: value } }));
    } else {
      setVitalForm(p => ({ ...p, [name]: value }));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Disease Management</h1>
          <p className="page-subtitle">Track medications, monitor vital signs and chronic conditions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => { setShowVitalForm(p => !p); setShowMedForm(false); }}>
            {showVitalForm ? '✕' : '+ Record Vitals'}
          </button>
          <button className="btn btn-primary" onClick={() => { setShowMedForm(p => !p); setShowVitalForm(false); }}>
            {showMedForm ? '✕' : '+ Add Medication'}
          </button>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {showMedForm && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Add Medication</h3>
          <form onSubmit={submitMed} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Medication Name</label>
                <input name="name" value={medForm.name} onChange={handleMedChange} placeholder="e.g. Metformin" required />
              </div>
              <div className="form-group">
                <label className="form-label">Dosage</label>
                <input name="dosage" value={medForm.dosage} onChange={handleMedChange} placeholder="e.g. 500mg" required />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <input name="frequency" value={medForm.frequency} onChange={handleMedChange} placeholder="e.g. Twice daily" required />
              </div>
              <div className="form-group">
                <label className="form-label">Route</label>
                <select name="route" value={medForm.route} onChange={handleMedChange}>
                  <option value="oral">Oral</option>
                  <option value="injection">Injection</option>
                  <option value="topical">Topical</option>
                  <option value="inhalation">Inhalation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" name="startDate" value={medForm.startDate} onChange={handleMedChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Indication (condition)</label>
                <input name="indication" value={medForm.indication} onChange={handleMedChange} placeholder="e.g. Type 2 Diabetes" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Special Instructions</label>
                <textarea name="instructions" value={medForm.instructions} onChange={handleMedChange} rows={2} placeholder="e.g. Take with food" />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowMedForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <span className="spinner" /> : 'Add Medication'}</button>
            </div>
          </form>
        </div>
      )}

      {showVitalForm && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Record Vital Signs</h3>
          <form onSubmit={submitVital} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Heart Rate (bpm)</label>
                <input type="number" name="heartRate" value={vitalForm.heartRate} onChange={handleVitalChange} placeholder="72" />
              </div>
              <div className="form-group">
                <label className="form-label">Temperature (°C)</label>
                <input type="number" step="0.1" name="temperature" value={vitalForm.temperature} onChange={handleVitalChange} placeholder="37.0" />
              </div>
              <div className="form-group">
                <label className="form-label">BP Systolic (mmHg)</label>
                <input type="number" name="systolic" value={vitalForm.bloodPressure.systolic} onChange={handleVitalChange} placeholder="120" />
              </div>
              <div className="form-group">
                <label className="form-label">BP Diastolic (mmHg)</label>
                <input type="number" name="diastolic" value={vitalForm.bloodPressure.diastolic} onChange={handleVitalChange} placeholder="80" />
              </div>
              <div className="form-group">
                <label className="form-label">O₂ Saturation (%)</label>
                <input type="number" name="oxygenSaturation" value={vitalForm.oxygenSaturation} onChange={handleVitalChange} placeholder="98" />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Glucose (mg/dL)</label>
                <input type="number" name="bloodGlucose" value={vitalForm.bloodGlucose} onChange={handleVitalChange} placeholder="90" />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" step="0.1" name="weight" value={vitalForm.weight} onChange={handleVitalChange} placeholder="70" />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" name="height" value={vitalForm.height} onChange={handleVitalChange} placeholder="170" />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowVitalForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <span className="spinner" /> : 'Save Vitals'}</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tabs}>
        {['medications', 'vitals'].map(t => (
          <button key={t} className={`${styles.tab} ${activeTab === t ? styles.activeTab : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'medications' ? `💊 Medications (${medications.length})` : `📊 Vitals History (${vitals.length})`}
          </button>
        ))}
      </div>

      {loading ? <div className={styles.loadingCenter}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div> : (
        <>
          {activeTab === 'medications' && (
            medications.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">💊</div><h3>No medications</h3><p>Add your first medication above</p></div>
            ) : (
              <div className={styles.cardList}>
                {medications.map(m => (
                  <div key={m._id} className={`card ${styles.itemCard}`}>
                    <div className={styles.itemInfo}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <div className={styles.itemTitle}>{m.name}</div>
                        <span className={`badge ${m.isActive ? 'badge-success' : 'badge-muted'}`}>{m.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className={styles.itemMeta}>{m.dosage} · {m.frequency} · {m.route} {m.indication ? `· ${m.indication}` : ''}</div>
                      {m.instructions && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>{m.instructions}</div>}
                      {m.prescribedBy && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prescribed by: Dr. {m.prescribedBy.name}</div>}
                    </div>
                    <div className={styles.itemActions}>
                      <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }} onClick={() => toggleMedStatus(m._id, m.isActive)}>
                        {m.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-ghost" style={{ fontSize: '0.78rem', color: 'var(--danger)' }} onClick={() => deleteMed(m._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'vitals' && (
            vitals.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No vitals recorded</h3><p>Record your first vital signs above</p></div>
            ) : (
              <div className={styles.cardList}>
                {vitals.map(v => (
                  <div key={v._id} className={`card ${styles.itemCard}`}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitle}>{new Date(v.recordedAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {v.heartRate && <span style={{ fontSize: '0.82rem' }}>❤️ {v.heartRate} bpm</span>}
                        {v.bloodPressure?.systolic && <span style={{ fontSize: '0.82rem' }}>🩸 {v.bloodPressure.systolic}/{v.bloodPressure.diastolic} mmHg</span>}
                        {v.temperature && <span style={{ fontSize: '0.82rem' }}>🌡️ {v.temperature}°C</span>}
                        {v.oxygenSaturation && <span style={{ fontSize: '0.82rem' }}>🫁 {v.oxygenSaturation}% O₂</span>}
                        {v.bmi && <span style={{ fontSize: '0.82rem' }}>⚖️ BMI {v.bmi}</span>}
                        {v.bloodGlucose && <span style={{ fontSize: '0.82rem' }}>🩸 {v.bloodGlucose} mg/dL</span>}
                      </div>
                    </div>
                    <button className="btn btn-ghost" style={{ fontSize: '0.78rem', color: 'var(--danger)' }} onClick={async () => { await vitalsAPI.delete(v._id); load(); }}>Delete</button>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
