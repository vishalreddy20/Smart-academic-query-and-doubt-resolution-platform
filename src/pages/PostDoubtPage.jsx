import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postDoubt, getSubjects } from '../services/api';
import { AlertCircle } from 'lucide-react';
import TopNavBar from '../components/TopNavBar';

export default function PostDoubtPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [urgency, setUrgency] = useState('normal');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await getSubjects();
      setSubjects(data.subjects || []);
      if (data.subjects && data.subjects.length > 0) {
        setSubjectId(data.subjects[0]._id);
      }
    } catch (err) {
      setError('Error loading subjects');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subjectId || !title.trim() || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }
    if (description.trim().length < 200) {
      setError('Description must be at least 200 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await postDoubt({
        subjectId,
        title,
        description,
      });

      setSuccess('Doubt posted successfully! Redirecting...');
      setTimeout(() => {
        navigate('/student');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error posting doubt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Navigation */}
      <TopNavBar
        withSidebar
        activePath="/post-doubt"
        navItems={[
          { label: 'Dashboard', path: '/student' },
          { label: 'Knowledge Base', path: '/knowledge-base' },
          { label: 'Post Doubt', path: '/post-doubt' },
        ]}
      />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 md:px-10 max-w-[1440px] mx-auto md:ml-72 min-h-screen">
        {/* Breadcrumb & Header */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-on-surface-variant text-xs uppercase tracking-widest mb-4">
            <button onClick={() => navigate('/student')} className="hover:text-secondary transition-colors">
              Dashboard
            </button>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-bold text-primary">Post Doubt</span>
          </nav>
          <h1 className="font-headline text-5xl text-primary font-bold leading-tight max-w-2xl mb-4">
            Submit New <span className="italic text-secondary">Academic Query</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
            Provide a detailed overview of your academic roadblock. Our curated panel of experts will review your query for clarity before matching it with a specialist.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-error-container border border-error text-on-error-container rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-8 p-4 bg-secondary-container border border-secondary text-on-secondary-container rounded-xl font-medium flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Canvas - Left Column */}
          <div className="lg:col-span-8 space-y-8">
            <section className="card-elevated p-10 space-y-8">
              {/* Department & Urgency Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Department Dropdown */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Academic Department
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    disabled={loading}
                    className="w-full bg-surface-container-low border-none rounded-lg py-4 px-4 text-on-surface font-medium focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all placeholder-on-surface-variant/50"
                  >
                    <option value="">Select Department</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Urgency Signal */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Urgency Signal
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUrgency('normal')}
                      disabled={loading}
                      className={`px-4 py-2 rounded-full border text-xs font-bold uppercase transition-all ${
                        urgency === 'normal'
                          ? 'bg-surface-container-low text-primary border-primary'
                          : 'border-outline-variant text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgency('high')}
                      disabled={loading}
                      className={`px-4 py-2 rounded-full border text-xs font-bold uppercase transition-all ${
                        urgency === 'high'
                          ? 'bg-surface-container-low text-primary border-primary'
                          : 'border-outline-variant text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container'
                      }`}
                    >
                      High Priority
                    </button>
                  </div>
                </div>
              </div>

              {/* Query Headline */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Query Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Analysis of Keynesian Multiplier in Post-Pandemic Emerging Markets"
                  disabled={loading}
                  className="w-full bg-surface-container-low border-none rounded-lg py-4 px-4 text-xl font-headline focus:ring-2 focus:ring-secondary/20 focus:outline-none placeholder-outline-variant transition-all"
                />
                <div className="flex justify-end">
                  <span className={`text-xs font-medium uppercase tracking-widest ${title.length < 5 ? 'text-error' : 'text-on-surface-variant'}`}>
                    {title.length}/100 characters
                  </span>
                </div>
              </div>

              {/* Deep-Dive Explanation */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Deep-Dive Explanation</label>
                  <span className="text-xs text-outline uppercase tracking-widest font-bold">Min 200 characters</span>
                </div>
                <div className="relative bg-surface-container-low rounded-lg group">
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-4 px-4 py-2 border-b border-outline-variant/10">
                    <button type="button" className="text-on-surface-variant hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-base">format_bold</span>
                    </button>
                    <button type="button" className="text-on-surface-variant hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-base">format_italic</span>
                    </button>
                    <button type="button" className="text-on-surface-variant hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                    </button>
                    <button type="button" className="text-on-surface-variant hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-base">functions</span>
                    </button>
                    <div className="h-4 w-[1px] bg-outline-variant/30" />
                    <button type="button" className="text-on-surface-variant hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-base">link</span>
                    </button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the theoretical context, the specific point of confusion, and any previous attempts at resolution..."
                    disabled={loading}
                    className="w-full bg-transparent border-none rounded-b-lg py-4 px-4 text-on-surface focus:ring-0 leading-relaxed min-h-[300px] placeholder-outline-variant transition-all focus:outline-none"
                    rows="10"
                  />
                </div>
                <div className="flex justify-end">
                  <span className={`text-xs font-medium uppercase tracking-widest ${description.length < 200 ? 'text-error' : 'text-on-surface-variant'}`}>
                    {description.length}/1000 characters
                  </span>
                </div>
              </div>

              {/* Reference Materials */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Reference Materials</label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-outline-variant/40 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl">upload_file</span>
                  </div>
                  <p className="font-bold text-on-surface">Drag & Drop academic artifacts</p>
                  <p className="text-xs text-on-surface-variant mt-1">PDFs, JPEGs, or MATLAB scripts up to 25MB</p>
                  <button
                    type="button"
                    className="mt-6 px-6 py-2 bg-surface-container-highest text-on-surface rounded-full text-xs font-bold uppercase tracking-widest hover:bg-outline-variant transition-colors"
                  >
                    Select from Library
                  </button>
                </div>

                {/* Uploaded Files List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary">attach_file</span>
                          <span className="text-sm text-on-surface font-medium truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-error hover:bg-error/10 p-1 rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-6 pt-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 px-10 py-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Submit Query</span>
                  <span className="material-symbols-outlined text-base">send</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/student')}
                  disabled={loading}
                  className="px-8 py-5 text-on-surface font-bold text-sm tracking-widest uppercase hover:underline transition-all disabled:opacity-50"
                >
                  Save as Draft
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Editorial Tips */}
            <div className="bg-surface-container-low p-8 rounded-xl space-y-6">
              <div className="flex items-center gap-3 text-secondary">
                <span className="material-symbols-outlined">lightbulb</span>
                <h3 className="font-headline text-2xl font-bold">Editorial Tips</h3>
              </div>
              <ul className="space-y-6">
                {[
                  { title: 'Context is Queen', desc: "Don't just post the question. Explain the broader concept you're studying so we can find the right specialist." },
                  { title: 'Visual Evidence', desc: 'Upload handwritten notes or diagrams. Visual representations often clarify doubts faster than text alone.' },
                  { title: 'Be Specific', desc: "Avoid 'I don't understand this.' Try 'I understand Step A, but don't see the logic connecting to Step B.'" },
                ].map((tip, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-on-surface">{tip.title}</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{tip.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Curator's Choice Card */}
            <div className="relative overflow-hidden rounded-xl bg-primary-container p-8 text-surface-container-lowest aspect-square flex flex-col justify-end group">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent" />
              </div>
              <div className="relative z-10 space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="inline-block px-3 py-1 bg-secondary text-on-secondary text-xs font-bold uppercase tracking-widest rounded">
                  Curator's Choice
                </span>
                <h4 className="font-headline text-2xl font-bold">Need Immediate Help?</h4>
                <p className="text-xs text-on-primary-container/90 leading-relaxed">Our 'Quick Resolve' panel is active now for STEM subjects. Average response time: 42 mins.</p>
              </div>
            </div>

            {/* Submission Health */}
            <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-outline">Submission Health</span>
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                  {title.length > 5 && description.length > 200 && subjectId ? 'Excellent' : title.length > 0 || description.length > 0 ? 'Good' : 'Start'}
                </span>
              </div>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (title.length / 100 + description.length / 1000 + (subjectId ? 0.3 : 0)) * 60)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
