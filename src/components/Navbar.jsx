import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

export default function Navbar() {
  const container = useRef();

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
    <nav ref={container} className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center mix-blend-difference text-white">
      <Link to="/" className="text-2xl font-bold tracking-tighter uppercase font-display">
        Eventa<span className="text-brand-primary">Sports</span>
      </Link>
      
      <div className="flex gap-8 font-medium">
        <Link to="/tournaments" className="hover:text-brand-primary transition-colors">Tournaments</Link>
        <Link to="/teams" className="hover:text-brand-secondary transition-colors">Teams</Link>
        <Link to="/about" className="hover:text-white/70 transition-colors">About</Link>
      </div>
      
      <Link to="/create" className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-brand-primary hover:text-white transition-all duration-300">
        Host Now
      </Link>
    </nav>
  );
}
