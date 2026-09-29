import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Dribbble,
  Instagram,
  Mail,
  Menu,
  X,
} from 'lucide-react';

const projects = [
  {
    number: '01',
    name: 'Goodkind',
    type: 'Brand strategy · Digital',
    year: '2025',
    image: 'photo-1497366754035-f200968a6e72',
    imageAlt: 'Sunlit, modern creative studio with a long communal table',
    tone: 'project-card--sage',
    summary: 'A clearer point of view for a new kind of creative studio.',
    detail: 'Goodkind is a small production studio making a big cultural footprint. Together, we shaped a warm identity and an editorial website that puts the people behind the work first.',
    services: 'Positioning, identity, website',
  },
  {
    number: '02',
    name: 'Still / Form',
    type: 'Art direction · E-commerce',
    year: '2024',
    image: 'photo-1494438639946-1ebd1d20bf85',
    imageAlt: 'Carefully composed still life with soft natural light',
    tone: 'project-card--pink',
    summary: 'Everyday objects, made to be kept.',
    detail: 'An independent homeware label needed an online home as considered as its objects. A quiet visual system and tactile product stories made room for the details to do the talking.',
    services: 'Art direction, identity, e-commerce',
  },
  {
    number: '03',
    name: 'Morrow',
    type: 'Product design · Digital',
    year: '2024',
    image: 'photo-1518005020951-eccb494ad742',
    imageAlt: 'Sculptural modern architecture against a pale sky',
    tone: 'project-card--blue',
    summary: 'A more human way to think about what comes next.',
    detail: 'Morrow helps people make more intentional choices about their money. I partnered with the team to build a digital experience that makes long-term planning feel clear, encouraging, and personal.',
    services: 'Product strategy, UX/UI, design system',
  },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/', Icon: Instagram },
  { label: 'Dribbble', href: 'https://dribbble.com/', Icon: Dribbble },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={closeMenu} aria-label="Maya Chen, home">
        <span className="brand-mark">mc<span>.</span></span>
        <span className="brand-caption">Independent designer</span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav id="primary-navigation" className={`primary-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
        <a href="#work" onClick={closeMenu}>Work <span>03</span></a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#contact" className="nav-contact" onClick={closeMenu}>Let’s talk <ArrowUpRight size={15} /></a>
      </nav>
    </header>
  );
}

function ProjectCard({ project, onOpen }) {
  return (
    <button className={`project-card ${project.tone}`} type="button" onClick={() => onOpen(project)} aria-label={`View ${project.name} project details`}>
      <span className="project-visual">
        <img src={`https://images.unsplash.com/${project.image}?auto=format&fit=crop&w=1200&q=85`} alt={project.imageAlt} loading="lazy" />
        <span className="project-open" aria-hidden="true"><ArrowUpRight size={19} /></span>
        <span className="project-number">SELECTED WORK / {project.number}</span>
      </span>
      <span className="project-meta">
        <span>
          <span className="project-name">{project.name}</span>
          <span className="project-type">{project.type}</span>
        </span>
        <span className="project-year">{project.year}</span>
      </span>
    </button>
  );
}

function ProjectDialog({ project, onClose }) {
  useEffect(() => {
    if (!project) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('dialog-open');
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('dialog-open');
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close project details"><X size={20} /></button>
        <img src={`https://images.unsplash.com/${project.image}?auto=format&fit=crop&w=1400&q=85`} alt={project.imageAlt} />
        <div className="dialog-copy">
          <p className="eyebrow">PROJECT {project.number} <span> / </span> {project.year}</p>
          <h2 id="dialog-title">{project.name}<span>.</span></h2>
          <p className="dialog-summary">{project.summary}</p>
          <p className="dialog-description">{project.detail}</p>
          <p className="dialog-services"><span>MY ROLE</span>{project.services}</p>
          <a className="text-link" href="#contact" onClick={onClose}>Have a project in mind? <ArrowUpRight size={15} /></a>
        </div>
      </section>
    </div>
  );
}

function ContactForm() {
  const [status, setStatus] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Project enquiry from ${formData.get('name')}`);
    const body = encodeURIComponent(`Hi Maya,\n\n${formData.get('message')}\n\n${formData.get('name')}\n${formData.get('email')}`);
    setStatus('Your email app is opening with your message.');
    window.location.href = `mailto:hello@mayachen.design?subject=${subject}&body=${body}`;
    event.currentTarget.reset();
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="contact-name">Your name<input id="contact-name" name="name" autoComplete="name" placeholder="Alex Morgan" required /></label>
        <label htmlFor="contact-email">Your email<input id="contact-email" type="email" name="email" autoComplete="email" placeholder="alex@company.com" required /></label>
      </div>
      <label htmlFor="contact-message">A little about your project<textarea id="contact-message" name="message" rows="4" placeholder="What are you working on?" required /></label>
      <div className="form-submit-row">
        <button className="submit-button" type="submit">Send an enquiry <ArrowUpRight size={17} /></button>
        <p className="form-status" aria-live="polite">{status}</p>
      </div>
    </form>
  );
}

function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <>
      <Header />
      <main id="top">
        <section className="hero page-wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span className="status-dot" /> INDEPENDENT DESIGNER <span className="eyebrow-slash">/</span> BROOKLYN, NY</p>
            <h1 id="hero-title">Maya<br /><em>Chen.</em></h1>
            <p className="hero-intro">I build thoughtful brands and digital things for a world that doesn’t sit still.</p>
            <a className="hero-link" href="#work">Explore selected work <ArrowDown size={16} /></a>
          </div>
          <div className="hero-image-wrap">
            <img className="hero-image" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1100&q=90" alt="Editorial portrait in warm afternoon light" />
            <div className="image-stamp" aria-label="Design with intention"><Asterisk size={21} /><span>DESIGN<br />WITH<br />INTENTION</span></div>
            <p className="image-caption">FIG. 01 <span>IN GOOD COMPANY</span></p>
          </div>
          <div className="hero-index" aria-hidden="true">MC — 2025</div>
        </section>

        <section className="work-section page-wrap" id="work" aria-labelledby="work-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A FEW RECENT FAVORITES <span className="eyebrow-slash">/</span> 2024—25</p>
              <h2 id="work-title">Selected work<span>.</span></h2>
            </div>
            <a className="section-side-link" href="#contact">Have a project? <ArrowUpRight size={15} /></a>
          </div>
          <div className="project-grid">
            {projects.map((project) => <ProjectCard key={project.number} project={project} onOpen={setSelectedProject} />)}
          </div>
          <div className="work-footer"><span>THOUGHTFULLY MADE, NEVER RUSHED.</span><span>03 / 03</span></div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div className="about-inner page-wrap">
            <div className="about-side">
              <p className="eyebrow">A LITTLE ABOUT ME</p>
              <span className="about-mark"><Asterisk size={26} /></span>
              <span className="about-side-note">CURIOUS BY NATURE<br />CAREFUL BY DESIGN</span>
            </div>
            <div className="about-copy">
              <h2 id="about-title">Good design should feel <em>like it could only ever be that way.</em></h2>
              <div className="about-bottom">
                <p>I’m an independent designer partnering with kind people to make useful, memorable things. My practice moves between brand, digital, and whatever the idea needs next.</p>
                <a className="text-link" href="#contact">A bit more about working together <ArrowRight size={16} /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section page-wrap" id="contact" aria-labelledby="contact-title">
          <div className="contact-intro">
            <p className="eyebrow"><span className="status-dot" /> OPEN FOR SELECT PROJECTS</p>
            <h2 id="contact-title">Have a good<br />one in <em>mind?</em></h2>
            <a className="email-link" href="mailto:hello@mayachen.design"><Mail size={16} /> hello@mayachen.design</a>
          </div>
          <ContactForm />
        </section>
      </main>

      <footer className="site-footer page-wrap">
        <a className="brand footer-brand" href="#top"><span className="brand-mark">mc<span>.</span></span><span className="brand-caption">Independent designer</span></a>
        <p>MADE WITH CARE IN BROOKLYN <Asterisk size={13} /> {new Date().getFullYear()}</p>
        <div className="social-links">{socialLinks.map(({ label, href, Icon }) => <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer"><Icon size={17} /></a>)}</div>
      </footer>
      <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}

export default App;
