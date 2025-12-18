import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

export default function Navbar() {
  const container = useRef();
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
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-2xl"
          aria-label="Toggle menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 flex flex-col gap-4">
          <Link to="/tournaments" onClick={() => setIsOpen(false)} className="hover:text-brand-primary transition-colors">Tournaments</Link>
          <Link to="/teams" onClick={() => setIsOpen(false)} className="hover:text-brand-secondary transition-colors">Teams</Link>
          <Link to="/matches" onClick={() => setIsOpen(false)} className="hover:text-brand-primary transition-colors">Matches</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-white/70 transition-colors">About</Link>
          <Link to="/create" onClick={() => setIsOpen(false)} className="px-6 py-2 bg-white text-black font-bold rounded-full text-center hover:bg-brand-primary hover:text-white transition-all">
            Host Now
          </Link>
        </div>
      )}
    </nav>
  );
}
