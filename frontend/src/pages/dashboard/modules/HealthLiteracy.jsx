import React, { useState, useEffect } from 'react';
import { educationAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './Module.module.css';

const CATEGORIES = [
  { value: 'disease-management', label: '🫀 Disease Management' },
  { value: 'maternal-health', label: '🤱 Maternal Health' },
  { value: 'nutrition', label: '🥗 Nutrition' },
  { value: 'mental-health', label: '🧠 Mental Health' },
  { value: 'fitness', label: '💪 Fitness' },
  { value: 'medication', label: '💊 Medication' },
  { value: 'prevention', label: '🛡️ Prevention' },
  { value: 'general', label: '🏥 General Health' },
];

const TYPE_ICONS = { article: '📄', video: '🎬', infographic: '📊', guide: '📖' };

export default function HealthLiteracy() {
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', summary: '', category: 'general', type: 'article',
    tags: '', imageUrl: '', readTime: 5
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.category = filter;
      if (search) params.search = search;
      const res = await educationAPI.getAll(params);
      setContents(res.data.data.contents || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, search]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      await educationAPI.create(payload);
      setShowForm(false);
      setForm({ title: '', content: '', summary: '', category: 'general', type: 'article', tags: '', imageUrl: '', readTime: 5 });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to publish content'); }
    setSubmitting(false);
  };

  const openContent = async (id) => {
    try {
      const res = await educationAPI.getById(id);
      setSelectedContent(res.data.data.content);
    } catch {}
  };

  const handleLike = async (id) => {
    try {
      await educationAPI.like(id);
      // Update local state
      setContents(p => p.map(c => {
        if (c._id !== id) return c;
        const liked = c.likes?.includes(user._id);
        return { ...c, likes: liked ? c.likes.filter(l => l !== user._id) : [...(c.likes || []), user._id] };
      }));
      if (selectedContent?._id === id) {
        const liked = selectedContent.likes?.includes(user._id);
        setSelectedContent(p => ({ ...p, likes: liked ? p.likes.filter(l => l !== user._id) : [...(p.likes || []), user._id] }));
      }
    } catch {}
  };

  const handleComment = async (id) => {
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      const res = await educationAPI.addComment(id, comment);
      setComment('');
      setSelectedContent(p => ({ ...p, comments: [...(p.comments || []), res.data.data.comment] }));
    } catch {}
    setCommenting(false);
  };

  const handleDeleteComment = async (contentId, commentId) => {
    try {
      await educationAPI.deleteComment(contentId, commentId);
      setSelectedContent(p => ({ ...p, comments: p.comments.filter(c => c._id !== commentId) }));
    } catch {}
  };

  if (selectedContent) {
    const isLiked = selectedContent.likes?.some(l => (l._id || l) === user._id);
    return (
      <div className={styles.page}>
        <button className="btn btn-ghost" onClick={() => setSelectedContent(null)} style={{ alignSelf: 'flex-start' }}>← Back to Library</button>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">{CATEGORIES.find(c => c.value === selectedContent.category)?.label || selectedContent.category}</span>
            <span className="badge badge-muted">{TYPE_ICONS[selectedContent.type]} {selectedContent.type}</span>
            {selectedContent.readTime && <span className="badge badge-muted">⏱ {selectedContent.readTime} min read</span>}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>{selectedContent.title}</h1>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            By {selectedContent.author?.name} · {new Date(selectedContent.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            · 👁 {selectedContent.views} views
          </div>
          {selectedContent.summary && (
            <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.92rem', fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--primary)' }}>
              {selectedContent.summary}
            </div>
          )}
          <div style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
            {selectedContent.content}
          </div>
          {selectedContent.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {selectedContent.tags.map(t => <span key={t} className="badge badge-muted">#{t}</span>)}
            </div>
          )}
          {/* Like & Comment bar */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className={`btn ${isLiked ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleLike(selectedContent._id)}
              style={{ gap: '0.4rem' }}
            >
              ❤️ {isLiked ? 'Liked' : 'Like'} · {selectedContent.likes?.length || 0}
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>💬 {selectedContent.comments?.length || 0} comments</span>
          </div>

          {/* Comments section */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' }}>Comments</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts…"
                onKeyDown={e => e.key === 'Enter' && handleComment(selectedContent._id)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={() => handleComment(selectedContent._id)} disabled={commenting || !comment.trim()}>
                {commenting ? <span className="spinner" /> : 'Post'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedContent.comments?.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No comments yet. Be the first!</div>
              )}
              {(selectedContent.comments || []).map(c => (
                <div key={c._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.82rem', fontWeight: 600, flexShrink: 0 }}>
                    {c.user?.name?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.user?.name}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.text}</div>
                  </div>
                  {(user._id === (c.user?._id || c.user) || user.role === 'admin') && (
                    <button className="btn btn-ghost" style={{ fontSize: '0.72rem', color: 'var(--danger)', padding: '0.3rem' }} onClick={() => handleDeleteComment(selectedContent._id, c._id)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Health Literacy</h1>
          <p className="page-subtitle">Educational resources, articles, guides, and health awareness content</p>
        </div>
        {(user.role === 'admin' || user.role === 'doctor') && (
          <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
            {showForm ? '✕ Cancel' : '+ Publish Content'}
          </button>
        )}
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Publish Educational Content</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Understanding Type 2 Diabetes" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="article">📄 Article</option>
                  <option value="video">🎬 Video Guide</option>
                  <option value="infographic">📊 Infographic</option>
                  <option value="guide">📖 Step-by-Step Guide</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Read Time (minutes)</label>
                <input type="number" name="readTime" value={form.readTime} onChange={handleChange} min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input name="tags" value={form.tags} onChange={handleChange} placeholder="diabetes, insulin, diet" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Summary (optional)</label>
                <input name="summary" value={form.summary} onChange={handleChange} placeholder="Brief description shown in card view" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Content</label>
                <textarea name="content" value={form.content} onChange={handleChange} rows={8} placeholder="Write your full article or guide content here…" required />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & filter */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search articles…" style={{ maxWidth: 280 }} />
      </div>
      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>All Topics</button>
        {CATEGORIES.map(c => (
          <button key={c.value} className={`${styles.filterBtn} ${filter === c.value ? styles.active : ''}`} onClick={() => setFilter(c.value)}>{c.label}</button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingCenter}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : contents.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📚</div><h3>No content found</h3><p>Be the first to publish educational content</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {contents.map(c => {
            const isLiked = c.likes?.some(l => (l._id || l) === user._id);
            return (
              <div key={c._id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary">{CATEGORIES.find(cat => cat.value === c.category)?.label?.split(' ').slice(1).join(' ') || c.category}</span>
                  <span style={{ fontSize: '1.2rem' }}>{TYPE_ICONS[c.type]}</span>
                </div>
                <div onClick={() => openContent(c._id)}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem', lineHeight: 1.3 }}>{c.title}</div>
                  {c.summary && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.summary}</div>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {c.readTime && <span>⏱ {c.readTime} min</span>}
                  <span>👁 {c.views}</span>
                  <span>By {c.author?.name}</span>
                </div>
                {c.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {c.tags.slice(0, 3).map(t => <span key={t} className="badge badge-muted" style={{ fontSize: '0.7rem' }}>#{t}</span>)}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.65rem' }}>
                  <button
                    className={`btn ${isLiked ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                    onClick={e => { e.stopPropagation(); handleLike(c._id); }}
                  >
                    ❤️ {c.likes?.length || 0}
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => openContent(c._id)}>
                    Read more →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
