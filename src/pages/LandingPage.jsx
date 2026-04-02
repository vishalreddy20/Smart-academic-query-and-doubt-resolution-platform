import { Link } from 'react-router-dom';

const WORKFLOW_ITEMS = [
  {
    title: 'Student Posts',
    desc: 'Articulate complex queries with rich-text tools and attachments for immediate faculty attention.',
    icon: 'edit_note',
    iconStyle: 'bg-secondary-container text-on-secondary-container',
  },
  {
    title: 'Faculty Resolves',
    desc: 'Verified educators provide deep-dive explanations, maintaining the highest academic standards.',
    icon: 'verified_user',
    iconStyle: 'bg-primary-container text-primary-fixed-dim',
  },
  {
    title: 'Admin Monitors',
    desc: 'System-wide oversight ensures response quality, integrity, and operational efficiency.',
    icon: 'monitoring',
    iconStyle: 'bg-surface-container-highest text-on-surface-variant',
  },
];

const FEATURES = [
  {
    title: 'Instant Semantic Search',
    desc: "Our AI-driven search doesn't just find keywords; it understands context. Navigate thousands of archived resolutions in milliseconds.",
    icon: 'manage_search',
    className: 'md:col-span-8 bg-surface-container-lowest',
  },
  {
    title: 'Verified Mentors',
    desc: 'Access a network of PhD-level faculty members verified for their domain expertise.',
    icon: 'school',
    className: 'md:col-span-4 bg-primary-container text-white',
  },
  {
    title: 'Progress Analytics',
    desc: 'Visualize learning gaps and resolution trends with high-fidelity performance dashboards.',
    icon: 'analytics',
    className: 'md:col-span-4 bg-surface-container-lowest',
  },
  {
    title: 'Knowledge Repository',
    desc: 'A growing library of academic truth, curated and peer-reviewed for lasting value.',
    icon: 'auto_stories',
    className: 'md:col-span-4 bg-surface-container-lowest',
  },
  {
    title: 'Real-time Support',
    desc: 'Urgent queries prioritized through our intelligent routing system for immediate attention.',
    icon: 'bolt',
    className: 'md:col-span-4 bg-surface-container-lowest border-t-4 border-secondary',
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The quality of feedback here is incomparable. It's not just an answer; it's an education in how to solve the problem next time.",
    name: 'Alex Chen',
    role: 'Masters in Physics',
  },
  {
    quote:
      'Scholar Ink provides the structured environment necessary for meaningful academic discourse. It allows us to reach students globally.',
    name: 'Dr. Sarah Vance',
    role: 'Senior Research Fellow',
  },
];

export default function LandingPage() {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-secondary-container selection:text-on-secondary-container">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-8 py-3 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-headline italic text-primary tracking-tight">The Academic Curator</span>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#workflow" className="text-secondary font-semibold border-b-2 border-secondary transition-colors py-1">Workflow</a>
              <a href="#capabilities" className="text-on-surface-variant hover:text-on-surface transition-colors py-1">Capabilities</a>
              <a href="#testimonials" className="text-on-surface-variant hover:text-on-surface transition-colors py-1">Voices</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity">
              Join
            </Link>
          </div>
        </div>
        <div className="bg-surface-container-high h-px w-full" />
      </header>

      <main className="pt-16">
        <section className="relative min-h-[860px] flex items-center overflow-hidden bg-surface py-20">
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="max-w-7xl mx-auto px-8 relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <h1 className="font-headline text-6xl md:text-7xl lg:text-8xl leading-[1.1] text-primary tracking-tight">
                The Intelligence <br />
                <span className="italic text-secondary">Layer</span> for <br />
                Academic Success
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant font-light leading-relaxed max-w-xl">
                Fast, focused, and faculty-verified doubt resolution for the modern scholar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/register" className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-medium shadow-lg hover:scale-[1.02] transition-transform">
                  Get Started
                </Link>
                <Link to="/knowledge-base" className="px-8 py-4 bg-surface-container-high text-on-surface rounded-xl font-medium hover:bg-surface-container-highest transition-colors text-center">
                  Explore Knowledge Base
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute -inset-4 bg-white/20 backdrop-blur-sm rounded-[2.5rem] border border-white/30" />
              <img
                alt="Academic library"
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80"
                className="rounded-[2rem] object-cover aspect-[4/5] w-full shadow-[0px_20px_40px_rgba(15,23,42,0.06)]"
              />
            </div>
          </div>
        </section>

        <section id="workflow" className="py-32 bg-surface-container-lowest relative">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-24 text-center">
              <span className="font-label text-secondary uppercase tracking-widest text-xs font-bold block mb-4">Workflow</span>
              <h2 className="font-headline text-4xl md:text-5xl text-primary">The Curated Lifecycle</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {WORKFLOW_ITEMS.map((item) => (
                <div key={item.title} className="group space-y-8 p-10 bg-surface rounded-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${item.iconStyle}`}>
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-headline text-2xl">{item.title}</h3>
                    <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="h-1 w-0 bg-secondary transition-all group-hover:w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="capabilities" className="py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <span className="font-label text-secondary uppercase tracking-widest text-xs font-bold block mb-4">Core Capabilities</span>
                <h2 className="font-headline text-5xl text-primary leading-tight">Engineered for Academic Excellence</h2>
              </div>
              <p className="text-on-surface-variant text-lg max-w-sm font-light">
                Advanced tools designed to bridge the gap between curiosity and comprehension.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {FEATURES.map((feature) => (
                <div key={feature.title} className={`${feature.className} p-10 rounded-3xl shadow-[0px_20px_40px_rgba(15,23,42,0.06)]`}>
                  <div className="flex flex-col h-full justify-between gap-12">
                    <span className={`material-symbols-outlined text-4xl ${feature.className.includes('primary-container') ? 'text-secondary-fixed-dim' : 'text-secondary'}`}>
                      {feature.icon}
                    </span>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-headline">{feature.title}</h3>
                      <p className={feature.className.includes('primary-container') ? 'text-primary-fixed-dim leading-relaxed' : 'text-on-surface-variant leading-relaxed'}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-8">
            <div className="bg-surface rounded-[3rem] p-16 md:p-24 flex flex-col md:flex-row items-center justify-around gap-16 text-center">
              <div className="space-y-2">
                <p className="text-5xl md:text-6xl font-headline text-primary">500+</p>
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Verified Faculty</p>
              </div>
              <div className="w-px h-16 bg-surface-container-highest hidden md:block" />
              <div className="space-y-2">
                <p className="text-5xl md:text-6xl font-headline text-primary">10k+</p>
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Doubts Resolved</p>
              </div>
              <div className="w-px h-16 bg-surface-container-highest hidden md:block" />
              <div className="space-y-2">
                <p className="text-5xl md:text-6xl font-headline text-primary">98%</p>
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Student Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-32 bg-surface overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 relative">
            <div className="mb-20">
              <span className="font-label text-secondary uppercase tracking-widest text-xs font-bold block mb-4">Testimonials</span>
              <h2 className="font-headline text-5xl text-primary">Voice of the Community</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {TESTIMONIALS.map((item) => (
                <div key={item.name} className="bg-surface-container-lowest p-12 rounded-[2rem] shadow-[0px_20px_40px_rgba(15,23,42,0.06)] relative">
                  <span className="text-8xl font-headline absolute top-6 right-10 text-surface-container opacity-50 select-none">"</span>
                  <div className="relative z-10 space-y-8">
                    <p className="text-2xl font-headline leading-relaxed italic text-on-surface">"{item.quote}"</p>
                    <div>
                      <h4 className="font-semibold text-primary">{item.name}</h4>
                      <p className="text-sm text-on-surface-variant font-label uppercase tracking-wider">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-8 bg-surface-container-lowest">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary to-primary-container p-16 md:p-24 text-center relative overflow-hidden">
            <div className="relative z-10 space-y-10">
              <h2 className="font-headline text-4xl md:text-6xl text-white leading-tight">
                Elevate Your Scholarly <br /> Pursuits Today
              </h2>
              <p className="text-primary-fixed-dim text-lg md:text-xl max-w-2xl mx-auto font-light">
                Join the Academic Community and experience a new standard in knowledge resolution.
              </p>
              <div className="flex justify-center">
                <Link to="/register" className="px-12 py-5 bg-white text-primary rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                  Join the Academic Community
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-lowest border-t border-surface-container-high">
        <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6 max-w-xs">
            <span className="text-xl font-headline italic text-primary">Scholar Ink</span>
            <p className="text-on-surface-variant text-xs font-label font-medium uppercase tracking-widest leading-loose">
              Editorial Authority in Knowledge. Bridging the gap between inquiry and understanding.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-colors text-xs font-label uppercase tracking-widest font-medium">Academic Integrity</a>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-colors text-xs font-label uppercase tracking-widest font-medium">Privacy Policy</a>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-colors text-xs font-label uppercase tracking-widest font-medium">Institutional Access</a>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-colors text-xs font-label uppercase tracking-widest font-medium">Support</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pb-12">
          <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} The Academic Curator. Editorial Authority in Knowledge.
          </p>
        </div>
      </footer>
    </div>
  );
}
