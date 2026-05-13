import React, { useState } from 'react';
import styles from './Module.module.css';

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Shortness of breath',
  'Chest pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Sore throat',
  'Runny nose', 'Body aches', 'Dizziness', 'Rash', 'Abdominal pain',
  'Back pain', 'Joint pain', 'Loss of appetite', 'Insomnia', 'Anxiety'
];

export default function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [age, setAge] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSymptom = (s) => setSelectedSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const addCustom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(p => [...p, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const analyze = async () => {
    if (selectedSymptoms.length === 0) { setError('Please select at least one symptom.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const prompt = `You are a medical triage assistant. A patient reports the following:
Symptoms: ${selectedSymptoms.join(', ')}
Duration: ${duration || 'Not specified'}
Severity: ${severity}
Age: ${age || 'Not specified'}
Additional info: ${additionalInfo || 'None'}

Provide a structured medical assessment in JSON format with these fields:
{
  "urgency": "emergency|urgent|soon|routine",
  "urgencyLabel": "Seek Emergency Care|See Doctor Soon|Schedule Appointment|Self-Care",
  "urgencyColor": "danger|warning|primary|success",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "redFlags": ["flag1", "flag2"],
  "selfCare": ["tip1", "tip2"],
  "disclaimer": "Important disclaimer text"
}

Be concise and clinically accurate. Do not diagnose, only assess and recommend.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setResult(JSON.parse(jsonMatch[0]));
      } else {
        setResult({ urgency: 'routine', urgencyLabel: 'Consult a Doctor', urgencyColor: 'primary', possibleConditions: [], recommendations: [text], redFlags: [], selfCare: [], disclaimer: 'Please consult a healthcare professional.' });
      }
    } catch (err) {
      setError('Analysis failed. Please consult a healthcare professional directly.');
    }
    setLoading(false);
  };

  const reset = () => { setSelectedSymptoms([]); setResult(null); setError(''); setDuration(''); setAdditionalInfo(''); };

  const URGENCY_ICONS = { emergency: '🚨', urgent: '⚠️', soon: '📋', routine: '✅' };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Symptom Checker</h1>
          <p className="page-subtitle">AI-powered preliminary assessment — not a substitute for medical advice</p>
        </div>
        {result && <button className="btn btn-outline" onClick={reset}>Start Over</button>}
      </div>

      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' }}>Select Your Symptoms</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {COMMON_SYMPTOMS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  style={{
                    padding: '0.4rem 0.85rem', borderRadius: '999px', fontSize: '0.82rem', cursor: 'pointer',
                    border: `1.5px solid ${selectedSymptoms.includes(s) ? 'var(--primary)' : 'var(--border)'}`,
                    background: selectedSymptoms.includes(s) ? 'var(--primary)' : 'white',
                    color: selectedSymptoms.includes(s) ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.15s'
                  }}
                >{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input value={customSymptom} onChange={e => setCustomSymptom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="Add custom symptom…" style={{ flex: 1 }} />
              <button className="btn btn-outline" onClick={addCustom}>Add</button>
            </div>
            {selectedSymptoms.length > 0 && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                <strong>Selected ({selectedSymptoms.length}):</strong> {selectedSymptoms.join(' · ')}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' }}>Additional Details</h3>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <select value={duration} onChange={e => setDuration(e.target.value)}>
                  <option value="">Select…</option>
                  <option value="less than 24 hours">Less than 24 hours</option>
                  <option value="1-3 days">1–3 days</option>
                  <option value="4-7 days">4–7 days</option>
                  <option value="1-2 weeks">1–2 weeks</option>
                  <option value="more than 2 weeks">More than 2 weeks</option>
                  <option value="chronic/recurring">Chronic / Recurring</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select value={severity} onChange={e => setSeverity(e.target.value)}>
                  <option value="mild">Mild — noticeable but manageable</option>
                  <option value="moderate">Moderate — affecting daily activity</option>
                  <option value="severe">Severe — significantly debilitating</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Age (optional)</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 35" min={1} max={120} />
              </div>
              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <input value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} placeholder="Allergies, existing conditions, medications…" />
              </div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', fontSize: '0.95rem' }} onClick={analyze} disabled={loading}>
            {loading ? <><span className="spinner" /> Analyzing…</> : '🩺 Analyze Symptoms'}
          </button>

          <div style={{ background: 'var(--warning-light)', border: '1px solid rgba(214,137,16,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--warning)' }}>
            ⚠️ This tool provides preliminary guidance only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade">
          <div className={`card`} style={{ padding: '1.5rem', borderLeft: `4px solid var(--${result.urgencyColor})` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>{URGENCY_ICONS[result.urgency]}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: `var(--${result.urgencyColor})` }}>{result.urgencyLabel}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Based on: {selectedSymptoms.join(', ')}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {result.possibleConditions?.length > 0 && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>🔍 Possible Conditions</h4>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {result.possibleConditions.map((c, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c}</li>)}
                </ul>
              </div>
            )}
            {result.recommendations?.length > 0 && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>📋 Recommendations</h4>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {result.recommendations.map((r, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r}</li>)}
                </ul>
              </div>
            )}
            {result.redFlags?.length > 0 && (
              <div className="card" style={{ padding: '1.25rem', background: 'var(--danger-light)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--danger)' }}>🚨 Red Flags — Seek Immediate Care If:</h4>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {result.redFlags.map((f, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>{f}</li>)}
                </ul>
              </div>
            )}
            {result.selfCare?.length > 0 && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>🏠 Self-Care Tips</h4>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {result.selfCare.map((t, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div style={{ background: 'var(--warning-light)', border: '1px solid rgba(214,137,16,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--warning)' }}>
            ⚠️ {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
