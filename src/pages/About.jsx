import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

export default function About() {
    const container = useRef();
    const titleRef = useRef();

    useGSAP(() => {
        if (titleRef.current) {
            gsap.fromTo(titleRef.current, 
                { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
                { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.8, ease: 'power4.out', delay: 0.3 }
            );
        }
        gsap.from('.about-content', {
            opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.5
        });
    }, { scope: container });

    return (
        <main ref={container} className="pt-32 px-6 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 ref={titleRef} className="text-6xl font-black font-display uppercase tracking-tighter mb-12">
                    About EventaSports
                </h1>
                
                <div className="space-y-8 text-lg text-white/70">
                    <p className="about-content">
                        <strong className="text-white">EventaSports</strong> is a professional tournament management platform 
                        designed for tournamnet organizers, gaming communities, and competitive players.
                    </p>
                    
                    <p className="about-content">
                        Our platform helps you <strong className="text-brand-primary">plan tournaments</strong>, 
                        <strong className="text-brand-secondary"> manage teams</strong>, 
                        <strong className="text-brand-primary"> generate schedules</strong>, and 
                        <strong className="text-brand-secondary"> track match results</strong> digitally.
                    </p>
                    
                    <div className="about-content p-8 bg-white/5 border border-white/10 rounded-2xl">
                        <h3 className="text-2xl font-bold text-white mb-4">Key Features</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <span className="text-brand-primary">✓</span>
                                Create and manage multiple tournaments
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-brand-primary">✓</span>
                                Register and organize teams
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-brand-primary">✓</span>
                                Auto-generate match brackets
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-brand-primary">✓</span>
                                Real-time score tracking
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
