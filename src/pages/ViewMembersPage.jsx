import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export default function ViewMembersPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/members`);
      setMembers(res.data.members || []);
    } catch {
      setError('Failed to load members. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Our Team | Smart Academic Query & Doubt Resolution Platform';
    fetchMembers();
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/team')}>
            ← Home
          </button>
          <div style={styles.headerText}>
            <h1 style={styles.title}>MEET OUR AMAZING TEAM</h1>
            <p style={styles.subtitle}>
              Smart Academic Query &amp; Doubt Resolution Platform
              {!loading && ` · ${members.length} member${members.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button style={styles.addBtn} onClick={() => navigate('/team/add')}>
            ＋ Add Member
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.centered}>
            <div style={styles.spinner} />
            <p style={{ color: '#64748b', marginTop: '16px' }}>Loading members…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && <div style={styles.errorBox}>{error}</div>}

        {/* Empty */}
        {!loading && !error && members.length === 0 && (
          <div style={styles.emptyBox}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>👥</div>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '24px' }}>
              No members yet. Add the first one!
            </p>
            <button style={styles.addBtnLarge} onClick={() => navigate('/team/add')}>
              ＋ Add First Member
            </button>
          </div>
        )}

        {/* Card Grid */}
        {!loading && !error && members.length > 0 && (
          <div style={styles.grid}>
            {members.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                onView={() => navigate(`/team/members/${member._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Member Card ─────────────────────────────────────────── */
function MemberCard({ member, onView }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = member.image && !imgError
    ? `${API_BASE}/uploads/${member.image}`
    : null;

  return (
    <div
      style={hovered ? { ...styles.card, ...styles.cardHover } : styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div style={styles.avatarWrap}>
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
        <div style={styles.avatarGlow} />
      </div>

      <h3 style={styles.memberName}>{member.name}</h3>
      <p style={styles.rollNumber}>{member.rollNumber}</p>
      <p style={styles.yearDegree}>{member.year} · {member.degree}</p>

      {/* Hobby Tags */}
      {member.hobbies?.length > 0 && (
        <div style={styles.hobbiesRow}>
          {member.hobbies.slice(0, 3).map((h) => (
            <span key={h} style={styles.hobbyTag}>{h}</span>
          ))}
          {member.hobbies.length > 3 && (
            <span style={styles.hobbyTag}>+{member.hobbies.length - 3}</span>
          )}
        </div>
      )}

      <button
        id={`view-member-${member._id}`}
        style={styles.viewBtn}
        onClick={onView}
      >
        View Details →
      </button>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    padding: '40px 24px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'fixed', width: '400px', height: '400px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
    borderRadius: '50%', top: '-100px', left: '-100px', pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed', width: '350px', height: '350px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
    borderRadius: '50%', bottom: '-80px', right: '-80px', pointerEvents: 'none',
  },
  content: { position: 'relative', maxWidth: '1100px', margin: '0 auto' },
  header: {
    display: 'flex', alignItems: 'center', gap: '20px',
    marginBottom: '48px', flexWrap: 'wrap',
  },
  headerText: { flex: 1, minWidth: '200px' },
  backBtn: {
    background: 'rgba(255,255,255,0.07)', color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    padding: '10px 18px', cursor: 'pointer', fontSize: '0.9rem',
    flexShrink: 0, fontFamily: 'inherit',
  },
  addBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    border: 'none', borderRadius: '12px', padding: '11px 22px',
    cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
    fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
    fontWeight: '900',
    background: 'linear-gradient(90deg, #818cf8, #c084fc, #f472b6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', letterSpacing: '0.04em',
  },
  subtitle: { margin: '6px 0 0', color: '#475569', fontSize: '0.85rem' },
  centered: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 0',
  },
  spinner: {
    width: '48px', height: '48px',
    border: '4px solid rgba(99,102,241,0.2)',
    borderTopColor: '#6366f1', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5', borderRadius: '14px', padding: '20px 24px',
    textAlign: 'center', fontSize: '0.95rem',
  },
  emptyBox: { textAlign: 'center', padding: '80px 24px' },
  addBtnLarge: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    border: 'none', borderRadius: '12px', padding: '14px 32px',
    cursor: 'pointer', fontWeight: '700', fontSize: '1rem', fontFamily: 'inherit',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
    padding: '32px 24px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center', transition: 'all 0.3s ease',
  },
  cardHover: {
    border: '1px solid rgba(99,102,241,0.45)',
    boxShadow: '0 20px 50px rgba(99,102,241,0.22)',
    transform: 'translateY(-5px)',
  },
  avatarWrap: { position: 'relative', marginBottom: '16px' },
  avatar: {
    width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover',
    border: '3px solid rgba(99,102,241,0.55)',
    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
    display: 'block',
  },
  avatarFallback: {
    width: '90px', height: '90px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: '2.2rem', fontWeight: '800', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    border: '3px solid rgba(99,102,241,0.55)',
    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
  },
  avatarGlow: {
    position: 'absolute', inset: '-4px', borderRadius: '50%',
    background: 'transparent', boxShadow: '0 0 20px rgba(99,102,241,0.35)',
    pointerEvents: 'none',
  },
  memberName: { margin: '0 0 4px', color: '#e2e8f0', fontSize: '1.08rem', fontWeight: '700' },
  rollNumber: { margin: '0 0 4px', color: '#818cf8', fontSize: '0.83rem', fontWeight: '600', letterSpacing: '0.04em' },
  yearDegree: { margin: '0 0 16px', color: '#475569', fontSize: '0.8rem' },
  hobbiesRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '20px' },
  hobbyTag: {
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc', borderRadius: '100px', padding: '3px 12px',
    fontSize: '0.73rem', fontWeight: '500',
  },
  viewBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    border: 'none', borderRadius: '10px', padding: '10px 24px',
    cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem',
    fontFamily: 'inherit', marginTop: 'auto',
    boxShadow: '0 4px 16px rgba(99,102,241,0.35)', transition: 'all 0.2s',
  },
};
