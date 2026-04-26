import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HOBBY_COLORS = [
  { bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.4)',  color: '#a5b4fc' },
  { bg: 'rgba(236,72,153,0.15)',  border: 'rgba(236,72,153,0.4)',  color: '#f9a8d4' },
  { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.4)',   color: '#86efac' },
  { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.4)',  color: '#fcd34d' },
  { bg: 'rgba(14,165,233,0.15)',  border: 'rgba(14,165,233,0.4)',  color: '#7dd3fc' },
  { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   color: '#fca5a5' },
];

export default function MemberDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/members/${id}`);
        setMember(res.data.member);
        document.title = `${res.data.member.name} | Smart Academic Query & Doubt Resolution Platform`;
      } catch {
        setError('Member not found or server error.');
        document.title = 'Member | Smart Academic Query & Doubt Resolution Platform';
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/api/members/${id}`);
      navigate('/team/view');
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
      alert('Failed to delete member. Please try again.');
    }
  };

  /* ─── Loading ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.centered}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b', marginTop: '16px' }}>Loading member…</p>
        </div>
      </div>
    );
  }

  /* ─── Error ───────────────────────────────────────────── */
  if (error || !member) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.centered}>
          <div style={styles.errorBox}>{error || 'Member not found.'}</div>
          <button style={{ ...styles.navBtn, marginTop: '20px' }} onClick={() => navigate('/team/view')}>
            ← Back to Team
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = member.image && !imgError
    ? `${API_BASE}/uploads/${member.image}`
    : null;

  /* ─── Main render ─────────────────────────────────────── */
  return (
    <div style={styles.wrapper}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.pageContent}>
        {/* Nav bar */}
        <div style={styles.navRow}>
          <button style={styles.navBtn} onClick={() => navigate('/team/view')}>
            ← Back to Team
          </button>
          <button
            style={confirmDelete ? styles.deleteBtnConfirm : styles.deleteBtn}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : confirmDelete ? '⚠ Confirm Delete?' : '🗑 Delete Member'}
          </button>
        </div>

        <div style={styles.card}>
          {/* Profile Top Section */}
          <div style={styles.topSection}>
            {/* Avatar */}
            <div style={styles.avatarContainer}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={member.name}
                  style={styles.avatar}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div style={styles.avatarFallback}>
                  {member.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            {/* Name + Badges */}
            <div style={styles.profileInfo}>
              <h1 style={styles.memberName}>{member.name}</h1>
              <div style={styles.badgeRow}>
                <span style={styles.badge}>{member.rollNumber}</span>
                <span style={styles.badge}>{member.year}</span>
                <span style={styles.badge}>{member.degree}</span>
              </div>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Detail Blocks */}
          <div style={styles.detailsGrid}>
            {member.aboutProject && (
              <DetailBlock icon="💡" title="About Project" value={member.aboutProject} wide />
            )}
            {member.certificate && (
              <DetailBlock icon="🎓" title="Certificate" value={member.certificate} />
            )}
            {member.internship && (
              <DetailBlock icon="🏢" title="Internship" value={member.internship} />
            )}
            {member.aboutYourAim && (
              <DetailBlock icon="🎯" title="About Your Aim" value={member.aboutYourAim} wide />
            )}
          </div>

          {/* Hobbies */}
          {member.hobbies?.length > 0 && (
            <div style={styles.hobbiesSection}>
              <h3 style={styles.sectionTitle}>🎮 Hobbies &amp; Interests</h3>
              <div style={styles.hobbiesRow}>
                {member.hobbies.map((hobby, i) => {
                  const col = HOBBY_COLORS[i % HOBBY_COLORS.length];
                  return (
                    <span
                      key={hobby}
                      style={{
                        ...styles.hobbyTag,
                        background: col.bg,
                        border: `1px solid ${col.border}`,
                        color: col.color,
                      }}
                    >
                      {hobby}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <p style={styles.memberSince}>
            Member since{' '}
            {new Date(member.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Block ──────────────────────────────────────── */
function DetailBlock({ icon, title, value, wide }) {
  return (
    <div style={wide ? { ...styles.detailBlock, ...styles.detailBlockWide } : styles.detailBlock}>
      <div style={styles.detailIcon}>{icon}</div>
      <div>
        <p style={styles.detailTitle}>{title}</p>
        <p style={styles.detailValue}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Styles ───────────────────────────────────────────── */
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    padding: '40px 24px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: 'relative', overflow: 'hidden',
  },
  orb1: {
    position: 'fixed', width: '420px', height: '420px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
    borderRadius: '50%', top: '-110px', right: '-110px', pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed', width: '360px', height: '360px',
    background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
    borderRadius: '50%', bottom: '-90px', left: '-90px', pointerEvents: 'none',
  },
  pageContent: { position: 'relative', maxWidth: '780px', margin: '0 auto' },
  centered: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', gap: '24px',
  },
  spinner: {
    width: '48px', height: '48px',
    border: '4px solid rgba(99,102,241,0.2)',
    borderTopColor: '#6366f1', borderRadius: '50%',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5', borderRadius: '14px', padding: '20px 32px', fontSize: '0.95rem',
  },
  navRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', gap: '12px',
  },
  navBtn: {
    background: 'rgba(255,255,255,0.07)', color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    padding: '10px 18px', cursor: 'pointer', fontSize: '0.9rem',
    fontFamily: 'inherit', transition: 'all 0.2s',
  },
  deleteBtn: {
    background: 'rgba(239,68,68,0.1)', color: '#f87171',
    border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
    padding: '10px 18px', cursor: 'pointer', fontSize: '0.88rem',
    fontFamily: 'inherit', transition: 'all 0.2s',
  },
  deleteBtnConfirm: {
    background: 'rgba(239,68,68,0.25)', color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.6)', borderRadius: '10px',
    padding: '10px 18px', cursor: 'pointer', fontSize: '0.88rem',
    fontFamily: 'inherit', fontWeight: '700',
  },
  card: {
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
    padding: '48px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
  },
  topSection: {
    display: 'flex', alignItems: 'center', gap: '36px',
    marginBottom: '32px', flexWrap: 'wrap',
  },
  avatarContainer: { flexShrink: 0 },
  avatar: {
    width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover',
    border: '4px solid rgba(99,102,241,0.6)',
    boxShadow: '0 8px 40px rgba(99,102,241,0.4)',
    display: 'block',
  },
  avatarFallback: {
    width: '150px', height: '150px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '4rem', fontWeight: '800',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '4px solid rgba(99,102,241,0.6)',
    boxShadow: '0 8px 40px rgba(99,102,241,0.4)',
  },
  profileInfo: { flex: 1 },
  memberName: {
    margin: '0 0 16px',
    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
    fontWeight: '900', color: '#ffffff', lineHeight: 1.15,
  },
  badgeRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  badge: {
    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
    color: '#a5b4fc', borderRadius: '100px', padding: '5px 16px',
    fontSize: '0.82rem', fontWeight: '600', letterSpacing: '0.03em',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    margin: '0 0 32px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px', marginBottom: '32px',
  },
  detailBlock: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '20px', display: 'flex',
    gap: '14px', alignItems: 'flex-start',
  },
  detailBlockWide: { gridColumn: '1 / -1' },
  detailIcon: { fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' },
  detailTitle: {
    margin: '0 0 6px', fontSize: '0.75rem', fontWeight: '700',
    color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em',
  },
  detailValue: { margin: 0, color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7 },
  hobbiesSection: { marginBottom: '24px' },
  sectionTitle: {
    margin: '0 0 14px', color: '#94a3b8', fontSize: '0.82rem',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em',
  },
  hobbiesRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  hobbyTag: { borderRadius: '100px', padding: '6px 18px', fontSize: '0.85rem', fontWeight: '600' },
  memberSince: {
    margin: '24px 0 0', color: '#334155', fontSize: '0.78rem',
    textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px',
  },
};
