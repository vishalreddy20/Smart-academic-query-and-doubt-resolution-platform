import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export default function AddMemberPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    year: '',
    degree: '',
    aboutProject: '',
    hobbies: '',
    certificate: '',
    internship: '',
    aboutYourAim: '',
  });

  useEffect(() => {
    document.title = 'Add Member | Smart Academic Query & Doubt Resolution Platform';
  }, []);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.rollNumber.trim()) newErrors.rollNumber = 'Roll Number is required';
    if (!form.year.trim()) newErrors.year = 'Year is required';
    if (!form.degree.trim()) newErrors.degree = 'Degree is required';
    if (!form.aboutProject.trim()) newErrors.aboutProject = 'About Project is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) formData.append('image', imageFile);

      await axios.post(`${API_BASE}/api/members`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      setTimeout(() => navigate('/team/view'), 2000);
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to add member. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Member Added!</h2>
          <p style={styles.successMsg}>Redirecting to team view…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/team')}>
            ← Back
          </button>
          <div>
            <h1 style={styles.title}>Add New Member</h1>
            <p style={styles.subtitle}>Fill in the details to register a team member</p>
          </div>
        </div>

        {serverError && <div style={styles.errorBanner}>{serverError}</div>}

        <form onSubmit={handleSubmit} style={styles.form} encType="multipart/form-data">
          {/* Profile Photo */}
          <div style={styles.photoSection}>
            <div style={styles.photoPreview}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={styles.previewImg} />
              ) : (
                <div style={styles.photoPlaceholder}>
                  <span style={{ fontSize: '2.5rem' }}>👤</span>
                  <span style={styles.photoHint}>Upload Photo</span>
                </div>
              )}
            </div>
            <label htmlFor="image-upload" style={styles.uploadLabel}>
              Choose Photo
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Grid Fields */}
          <div style={styles.grid}>
            <Field
              id="name"
              label="Full Name *"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Ravi Kumar"
            />
            <Field
              id="rollNumber"
              label="Roll Number *"
              name="rollNumber"
              value={form.rollNumber}
              onChange={handleChange}
              error={errors.rollNumber}
              placeholder="e.g. 21CSE4056"
            />
            <Field
              id="year"
              label="Year *"
              name="year"
              value={form.year}
              onChange={handleChange}
              error={errors.year}
              placeholder="e.g. 3rd Year"
            />
            <Field
              id="degree"
              label="Degree *"
              name="degree"
              value={form.degree}
              onChange={handleChange}
              error={errors.degree}
              placeholder="e.g. B.Tech CSE"
            />
            <Field
              id="certificate"
              label="Certificate"
              name="certificate"
              value={form.certificate}
              onChange={handleChange}
              placeholder="e.g. AWS Cloud Practitioner"
            />
            <Field
              id="internship"
              label="Internship"
              name="internship"
              value={form.internship}
              onChange={handleChange}
              placeholder="e.g. Google Summer Intern"
            />
          </div>

          {/* Hobbies */}
          <div style={styles.fieldWrap}>
            <label htmlFor="hobbies" style={styles.label}>
              Hobbies <span style={styles.hint}>(comma separated)</span>
            </label>
            <input
              id="hobbies"
              type="text"
              name="hobbies"
              value={form.hobbies}
              onChange={handleChange}
              placeholder="e.g. Coding, Chess, Photography"
              style={styles.input}
            />
          </div>

          {/* Textareas */}
          <TextArea
            id="aboutProject"
            label="About Project *"
            name="aboutProject"
            value={form.aboutProject}
            onChange={handleChange}
            error={errors.aboutProject}
            placeholder="Describe your project..."
          />
          <TextArea
            id="aboutYourAim"
            label="About Your Aim"
            name="aboutYourAim"
            value={form.aboutYourAim}
            onChange={handleChange}
            placeholder="What are your career goals?"
          />

          <button
            id="submit-member-btn"
            type="submit"
            disabled={submitting}
            style={submitting ? { ...styles.submitBtn, ...styles.submitBtnDisabled } : styles.submitBtn}
          >
            {submitting ? 'Saving…' : '✓ Add Member'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Sub-Components ─────────────────────────────────────── */
function Field({ id, label, name, value, onChange, error, placeholder }) {
  return (
    <div style={styles.fieldWrap}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={error ? { ...styles.input, ...styles.inputError } : styles.input}
      />
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

function TextArea({ id, label, name, value, onChange, error, placeholder }) {
  return (
    <div style={styles.fieldWrap}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        style={error ? { ...styles.input, ...styles.textarea, ...styles.inputError } : { ...styles.input, ...styles.textarea }}
      />
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 16px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'fixed',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
    borderRadius: '50%',
    top: '-80px',
    right: '-80px',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    bottom: '-60px',
    left: '-60px',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '48px',
    width: '100%',
    maxWidth: '700px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '36px',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.08)',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.35)',
    color: '#fca5a5',
    borderRadius: '12px',
    padding: '14px 20px',
    marginBottom: '24px',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  photoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '20px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  photoPreview: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid rgba(99,102,241,0.5)',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  photoHint: {
    fontSize: '0.7rem',
    color: '#475569',
  },
  uploadLabel: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '10px',
    padding: '10px 22px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
    transition: 'all 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  hint: {
    textTransform: 'none',
    fontWeight: '400',
    fontSize: '0.78rem',
    color: '#475569',
  },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '13px 16px',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border 0.2s',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  inputError: {
    border: '1px solid rgba(239,68,68,0.6)',
  },
  textarea: {
    resize: 'vertical',
    lineHeight: 1.6,
  },
  fieldError: {
    color: '#f87171',
    fontSize: '0.8rem',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
    transition: 'all 0.25s ease',
    letterSpacing: '0.02em',
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  successBox: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(110,231,183,0.3)',
    borderRadius: '24px',
    padding: '60px 48px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
  },
  successIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6ee7b7, #34d399)',
    color: '#064e3b',
    fontSize: '2rem',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 8px 24px rgba(110,231,183,0.4)',
  },
  successTitle: {
    color: '#6ee7b7',
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: '0 0 12px',
  },
  successMsg: {
    color: '#64748b',
    fontSize: '0.95rem',
  },
};
