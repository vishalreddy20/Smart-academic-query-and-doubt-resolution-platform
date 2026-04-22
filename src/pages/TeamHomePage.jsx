import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeamHomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Smart Academic Query & Doubt Resolution Platform';
  }, []);

  return (
    <div style={styles.wrapper}>
      {/* Animated Background Orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.card}>
        {/* Badge */}
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          Team Portal · B.Tech CSE - Data Science
        </div>

        {/* Platform Name */}
        <h1 style={styles.heading}>
          <span style={styles.line1}>SMART ACADEMIC QUERY</span>
          <span style={styles.ampersand}>&amp;</span>
          <span style={styles.line2}>DOUBT RESOLUTION</span>
          <span style={styles.line3}>PLATFORM</span>
        </h1>

        <p style={styles.subtitle}>Team Members Management Portal</p>

        <p style={styles.description}>
          Add, manage, and explore all team members of the Smart Academic
          Query &amp; Doubt Resolution Platform — your all‑in‑one directory.
        </p>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button
            id="add-member-btn"
            style={styles.primaryBtn}
            onClick={() => navigate('/team/add')}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.primaryBtnHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.primaryBtn)}
          >
            <span>＋</span> Add Member
          </button>

          <button
            id="view-members-btn"
            style={styles.secondaryBtn}
            onClick={() => navigate('/team/view')}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.secondaryBtnHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.secondaryBtn)}
          >
            <span>👥</span> View Members
          </button>
        </div>

        <p style={styles.footerNote}>
          3rd Year · B.Tech CSE - Data Science · 2023–2027
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  orb1: {
    position: 'absolute', width: '420px', height: '420px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.38) 0%, transparent 70%)',
    borderRadius: '50%', top: '-100px', left: '-100px',
  },
  orb2: {
    position: 'absolute', width: '380px', height: '380px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
    borderRadius: '50%', bottom: '-80px', right: '-80px',
  },
  orb3: {
    position: 'absolute', width: '220px', height: '220px',
    background: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)',
    borderRadius: '50%', top: '45%', left: '62%',
  },
  card: {
    position: 'relative',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(28px)',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: '28px',
    padding: '64px 60px',
    maxWidth: '560px',
    width: '92%',
    textAlign: 'center',
    boxShadow: '0 36px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1)',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
    borderRadius: '100px', padding: '6px 20px', fontSize: '12px',
    color: '#a5b4fc', fontWeight: '600', letterSpacing: '0.06em',
    marginBottom: '32px', textTransform: 'uppercase',
  },
  badgeDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#6ee7b7', boxShadow: '0 0 8px #6ee7b7', display: 'inline-block',
  },
  heading: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '2px', margin: '0 0 16px', lineHeight: 1.1,
  },
  line1: {
    fontSize: 'clamp(1.1rem, 3.2vw, 1.55rem)',
    fontWeight: '900', color: '#ffffff', letterSpacing: '0.08em',
  },
  ampersand: {
    fontSize: 'clamp(1.3rem, 3.8vw, 1.8rem)', fontWeight: '900',
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', letterSpacing: '0.04em', margin: '2px 0',
  },
  line2: {
    fontSize: 'clamp(1.1rem, 3.2vw, 1.55rem)',
    fontWeight: '900', color: '#ffffff', letterSpacing: '0.08em',
  },
  line3: {
    fontSize: 'clamp(1.4rem, 4.2vw, 2.1rem)', fontWeight: '900',
    background: 'linear-gradient(90deg, #818cf8, #c084fc, #f472b6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', letterSpacing: '0.12em', marginTop: '4px',
  },
  subtitle: { fontSize: '1rem', color: '#94a3b8', margin: '0 0 16px', fontWeight: '500' },
  description: { fontSize: '0.88rem', color: '#475569', lineHeight: 1.75, margin: '0 0 28px' },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
    margin: '0 0 32px',
  },
  buttonGroup: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    border: 'none', borderRadius: '14px', padding: '14px 34px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)', transition: 'all 0.25s ease',
    letterSpacing: '0.02em', fontFamily: 'inherit',
  },
  primaryBtnHover: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff',
    border: 'none', borderRadius: '14px', padding: '14px 34px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 12px 32px rgba(99,102,241,0.65)', transition: 'all 0.25s ease',
    letterSpacing: '0.02em', transform: 'translateY(-2px)', fontFamily: 'inherit',
  },
  secondaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.07)', color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px',
    padding: '14px 34px', fontSize: '1rem', fontWeight: '700',
    cursor: 'pointer', transition: 'all 0.25s ease', letterSpacing: '0.02em',
    fontFamily: 'inherit',
  },
  secondaryBtnHover: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.14)', color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '14px',
    padding: '14px 34px', fontSize: '1rem', fontWeight: '700',
    cursor: 'pointer', transition: 'all 0.25s ease', letterSpacing: '0.02em',
    transform: 'translateY(-2px)', fontFamily: 'inherit',
  },
  footerNote: { marginTop: '36px', fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '0.04em', fontWeight: '500' },
};
