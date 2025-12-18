import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);
  const container = useRef();
const titleLine1 = useRef();
const titleLine2 = useRef();
const descLines = useRef([]);
const ctaButtons = useRef([]);
  
  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Block reveal for title lines
    if (titleLine1.current) {
      tl.fromTo(titleLine1.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 1, ease: 'power4.out' }
      );
    }
    if (titleLine2.current) {
      tl.fromTo(titleLine2.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 1, ease: 'power4.out' }
        , '-=0.5');
    }

    // Description lines fade in one by one
    descLines.current.forEach((line, i) => {
      if (line) {
        tl.from(line, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out'
        }, i === 0 ? '-=0.3' : '-=0.4');
      }
    });

    // CTA buttons fade in
    ctaButtons.current.forEach((btn, i) => {
      if (btn) {
        tl.from(btn, {
          opacity: 0,
          y: 15,
          duration: 0.5,
          ease: 'power2.out'
        }, i === 0 ? '-=0.2' : '-=0.3');
      }
    });

    // Feature cards stagger animation
    gsap.from('.feature-card', {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top 80%',
      }
    });

  }, { scope: container });

  return (
    <main ref={container} className="min-h-screen relative pt-32 px-6">
      <section className="h-[85vh] flex flex-col justify-center items-center text-center z-10 relative">
        {/* Main Title with Block Reveal */}
        <h1 className="text-[12vw] md:text-[10vw] leading-[0.9] font-black tracking-tighter uppercase font-display">
          <span
            ref={titleLine1}
            className="block overflow-hidden"
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            Dominate
          </span>
          <span
            ref={titleLine2}
            className="block overflow-hidden text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary"
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            The Arena
          </span>
        </h1>
        
        {/* Description - Line by Line Fade In */}
        <div className="mt-10 max-w-2xl text-xl md:text-2xl text-white/60 font-light space-y-2">
          <p ref={el => descLines.current[0] = el} style={{ opacity: 0 }}>
            The ultimate platform for organizing next-gen eSports tournaments.
          </p>
          <p ref={el => descLines.current[1] = el} style={{ opacity: 0 }}>
            Plan tournaments, manage teams, generate schedules,
          </p>
          <p ref={el => descLines.current[2] = el} style={{ opacity: 0 }}>
            and track match results digitally.
          </p>
        </div>
        
        {/* CTA Buttons - Fade In */}
        <div className="mt-14 flex gap-6">
          <Link
            ref={el => ctaButtons.current[0] = el}
            to="/tournaments"
            className="px-10 py-5 bg-brand-primary text-white font-bold text-lg hover:scale-105 transition-transform"
            style={{ opacity: 0 }}
          >
            Get Started
          </Link>
          <Link
            ref={el => ctaButtons.current[1] = el}
            to="/tournaments"
            className="px-10 py-5 border-2 border-white/30 hover:bg-white/10 font-semibold text-lg transition-colors"
            style={{ opacity: 0 }}
          >
            View Brackets
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-32 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tight text-center mb-20">
          Everything You Need
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-primary/50 transition-colors">
            <div className="text-5xl mb-6">🏆</div>
            <h3 className="text-2xl font-bold mb-4">Plan Tournaments</h3>
            <p className="text-white/60">Create single or double elimination brackets. Customize rules and formats for any game.</p>
          </div>

          <div className="feature-card p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-secondary/50 transition-colors">
            <div className="text-5xl mb-6">👥</div>
            <h3 className="text-2xl font-bold mb-4">Manage Teams</h3>
            <p className="text-white/60">Register teams, track rosters, and manage player information all in one place.</p>
          </div>

          <div className="feature-card p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-primary/50 transition-colors">
            <div className="text-5xl mb-6">📊</div>
            <h3 className="text-2xl font-bold mb-4">Track Results</h3>
            <p className="text-white/60">Update scores in real-time. Automatic bracket progression and winner determination.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
