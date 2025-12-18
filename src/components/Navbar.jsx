import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState, useEffect } from 'react';

export default function Navbar() {
  const container = useRef();
  const menuRef = useRef();
  const [isOpen, setIsOpen] = useState(false);

  useGSAP(() => {
    gsap.from(container.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.5
    });
  }, { scope: container });

  // Animate menu open/close
  useEffect(() => {
    if (!menuRef.current) return;

    if (isOpen) {
      // Curtain animation - slide from right
      gsap.fromTo(menuRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
      // Stagger nav links from right
      gsap.fromTo('.mobile-nav-link',
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, [isOpen]);

  const closeMenu = () => {
    // Animate out before closing
    gsap.to('.mobile-nav-link', {
      x: 50, opacity: 0, duration: 0.15, stagger: 0.03, ease: 'power2.in'
    });
    gsap.to(menuRef.current, {
      x: '100%', opacity: 0, duration: 0.3, ease: 'power3.in', delay: 0.15,
      onComplete: () => setIsOpen(false)
    });
  };

  return (
    <nav ref={container} className="fixed top-0 left-0 w-full px-4 md:px-6 py-2 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10 text-white">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-tighter uppercase font-display">
          Eventa<span className="text-brand-primary">Sports</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 font-medium">
          <Link to="/tournaments" className="hover:text-brand-primary transition-colors">Tournaments</Link>
          <Link to="/teams" className="hover:text-brand-secondary transition-colors">Teams</Link>
          <Link to="/matches" className="hover:text-brand-primary transition-colors">Matches</Link>
          <Link to="/about" className="hover:text-white/70 transition-colors">About</Link>
        </div>

        {/* Desktop CTA */}
        <Link to="/create" className="hidden md:block px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-brand-primary hover:text-white transition-all duration-300">
          Host Now
        </Link>

        {/* Mobile Hamburger */}
        <button
          onClick={() => isOpen ? closeMenu() : setIsOpen(true)}
          className="md:hidden p-2 text-2xl z-50"
          aria-label="Toggle menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu - Slide from Right */}
      {isOpen && (
        <div
          ref={menuRef}
          className="md:hidden fixed top-0 right-0 h-screen w-3/4 max-w-xs bg-black/95 backdrop-blur-xl border-l border-white/10 pt-20 px-6 flex flex-col gap-6"
          style={{ transform: 'translateX(100%)' }}
        >
          <Link to="/tournaments" onClick={closeMenu} className="mobile-nav-link px-5 py-4 text-xl font-medium hover:text-brand-primary transition-colors text-left bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            Tournaments
          </Link>
          <Link to="/teams" onClick={closeMenu} className="mobile-nav-link px-5 py-4 text-xl font-medium hover:text-brand-secondary transition-colors text-left bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            Teams
          </Link>
          <Link to="/matches" onClick={closeMenu} className="mobile-nav-link px-5 py-4 text-xl font-medium hover:text-brand-primary transition-colors text-left bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            Matches
          </Link>
          <Link to="/about" onClick={closeMenu} className="mobile-nav-link px-5 py-4 text-xl font-medium hover:text-white/70 transition-colors text-left bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            About
          </Link>
          <Link to="/create" onClick={closeMenu} className="mobile-nav-link mt-4 px-5 py-4 bg-white text-black font-bold rounded-2xl text-center hover:bg-brand-primary hover:text-white transition-all">
            Host Now
          </Link>
        </div>
      )}

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[-1]"
          onClick={closeMenu}
        />
      )}
    </nav>
  );
}
