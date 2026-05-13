import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsAPI, vitalsAPI, medicationsAPI } from '../../lib/api';
import styles from './Overview.module.css';

const MODULES = [
  { path: '/dashboard/telemedicine', label: 'Telemedicine', icon: '📹', color: '#0a6e6e', desc: 'Book & manage virtual appointments' },
  { path: '/dashboard/disease-management', label: 'Disease Management', icon: '🫀', color: '#8b4513', desc: 'Track chronic conditions' },
  { path: '/dashboard/maternal-health', label: 'Maternal Health', icon: '🤱', color: '#9b59b6', desc: 'Pregnancy care & monitoring' },
  { path: '/dashboard/health-screening', label: 'Health Screening', icon: '🔬', color: '#2980b9', desc: 'Community screening events' },
  { path: '/dashboard/symptom-checker', label: 'Symptom Checker', icon: '🩺', color: '#27ae60', desc: 'AI-powered symptom analysis' },
  { path: '/dashboard/ehr', label: 'EHR System', icon: '📋', color: '#e67e22', desc: 'Electronic health records' },
  { path: '/dashboard/rehabilitation', label: 'Rehabilitation', icon: '🧘', color: '#16a085', desc: 'Recovery programs & workshops' },
  { path: '/dashboard/waste-management', label: 'Waste Management', icon: '♻️', color: '#27ae60', desc: 'Medical waste tracking' },
  { path: '/dashboard/health-literacy', label: 'Health Literacy', icon: '📚', color: '#8e44ad', desc: 'Educational resources' },
];

const StatCard = ({ icon, value, label, color }) => (
  <div className={`card ${styles.statCard}`} style={{ '--stat-color': color }}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, medications: 0 });
  const [recentAppts, setRecentAppts] = useState([]);
  const [latestVitals, setLatestVitals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, medRes, vitalRes] = await Promise.allSettled([
          appointmentsAPI.getAll({ limit: 5 }),
          medicationsAPI.getAll({ isActive: true }),
          vitalsAPI.getLatest()
        ]);

        if (apptRes.status === 'fulfilled') {
          setRecentAppts(apptRes.value.data.data.appointments || []);
          setStats(s => ({ ...s, appointments: apptRes.value.data.data.total || 0 }));
        }
        if (medRes.status === 'fulfilled') {
          setStats(s => ({ ...s, medications: medRes.value.data.data.medications?.length || 0 }));
        }
        if (vitalRes.status === 'fulfilled') {
          setLatestVitals(vitalRes.value.data.data.vital);
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={styles.overview}>
      <div className={styles.welcomeBar}>
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">{today}</p>
        </div>
        <Link to="/dashboard/telemedicine" className="btn btn-primary">
          + Book Appointment
        </Link>
      </div>

      {/* Stat cards */}
      <div className={styles.stats}>
        <StatCard icon="📅" value={stats.appointments} label="Appointments" color="#0a6e6e" />
        <StatCard icon="💊" value={stats.medications} label="Active Medications" color="#8b4513" />
        <StatCard icon="❤️" value={latestVitals?.heartRate ? `${latestVitals.heartRate} bpm` : '—'} label="Heart Rate" color="#e74c3c" />
        <StatCard icon="🩸" value={latestVitals?.bloodPressure?.systolic ? `${latestVitals.bloodPressure.systolic}/${latestVitals.bloodPressure.diastolic}` : '—'} label="Blood Pressure" color="#3498db" />
      </div>

      {/* Recent appointments */}
      <div className={styles.twoCol}>
        <div className={`card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h3>Recent Appointments</h3>
            <Link to="/dashboard/telemedicine" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></div>
          ) : recentAppts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No appointments yet</h3>
              <p>Book your first consultation</p>
            </div>
          ) : (
            <div className={styles.apptList}>
              {recentAppts.map(a => (
                <div key={a._id} className={styles.apptItem}>
                  <div className={styles.apptDate}>
                    <span>{new Date(a.date).getDate()}</span>
                    <span>{new Date(a.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className={styles.apptInfo}>
                    <div className={styles.apptTitle}>{a.reason}</div>
                    <div className={styles.apptDoctor}>Dr. {a.doctor?.name} · {a.time}</div>
                  </div>
                  <span className={`badge badge-${statusColor(a.status)}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h3>Latest Vitals</h3>
            <Link to="/dashboard/ehr" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>View EHR →</Link>
          </div>
          {latestVitals ? (
            <div className={styles.vitalsGrid}>
              {[
                { label: '❤️ Heart Rate', value: latestVitals.heartRate ? `${latestVitals.heartRate} bpm` : '—' },
                { label: '🩸 Blood Pressure', value: latestVitals.bloodPressure?.systolic ? `${latestVitals.bloodPressure.systolic}/${latestVitals.bloodPressure.diastolic} mmHg` : '—' },
                { label: '🌡️ Temperature', value: latestVitals.temperature ? `${latestVitals.temperature}°C` : '—' },
                { label: '🫁 O₂ Saturation', value: latestVitals.oxygenSaturation ? `${latestVitals.oxygenSaturation}%` : '—' },
                { label: '⚖️ BMI', value: latestVitals.bmi ? latestVitals.bmi : '—' },
                { label: '🩸 Blood Glucose', value: latestVitals.bloodGlucose ? `${latestVitals.bloodGlucose} mg/dL` : '—' },
              ].map(v => (
                <div key={v.label} className={styles.vitalItem}>
                  <div className={styles.vitalLabel}>{v.label}</div>
                  <div className={styles.vitalValue}>{v.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>No vitals recorded</h3>
              <p>Add your first vital signs in the EHR section</p>
            </div>
          )}
        </div>
      </div>

      {/* Module grid */}
      <div className={styles.modulesSection}>
        <h3 className={styles.modulesTitle}>Healthcare Modules</h3>
        <div className={styles.moduleGrid}>
          {MODULES.map(m => (
            <Link key={m.path} to={m.path} className={`card ${styles.moduleCard}`}>
              <div className={styles.moduleIcon} style={{ background: `${m.color}18`, color: m.color }}>{m.icon}</div>
              <div className={styles.moduleLabel}>{m.label}</div>
              <div className={styles.moduleDesc}>{m.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

function statusColor(status) {
  return { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'danger' }[status] || 'muted';
}
