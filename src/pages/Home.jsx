import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const container = useRef();
  
  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from('.hero-text', {
      y: 100,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: 'power4.out',
      delay: 1
    })
    .from('.hero-sub', {
      opacity: 0,
      y: 20,
      duration: 1
    }, '-=1');

  }, { scope: container });

  return (
    <main ref={container} className="min-h-screen relative pt-32 px-6">
      <section className="h-[80vh] flex flex-col justify-center items-center text-center z-10 relative">
        <h1 className="hero-text text-[10vw] leading-[0.9] font-black tracking-tighter uppercase font-display mix-blend-overlay">
          Dominate<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">The Arena</span>
        </h1>
        
        <p className="hero-sub mt-8 text-xl md:text-2xl max-w-2xl text-white/60 font-light">
          The ultimate platform for organizing next-gen eSports tournaments. 
          Manage teams, schedule matches, and track results in real-time.
        </p>
        
        <div className="hero-sub mt-12 flex gap-4">
            <button className="px-8 py-4 bg-brand-primary text-white font-bold rounded-none hover:scale-105 transition-transform">
                Get Started
            </button>
            <button className="px-8 py-4 border border-white/20 hover:bg-white/10 transition-colors">
                View Brackts
            </button>
        </div>
      </section>

      {/* Placeholder for feature list or recent tournaments */}
      <section className="min-h-screen py-20">
          {/* Content will go here */}
      </section>
    </main>
  );
}
