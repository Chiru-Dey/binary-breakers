import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

export default function Teams() {
    const container = useRef();
    const titleRef = useRef();

    useGSAP(() => {
        if (titleRef.current) {
            gsap.fromTo(titleRef.current, 
                { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
                { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.8, ease: 'power4.out', delay: 0.3 }
            );
        }
    }, { scope: container });

    return (
        <main ref={container} className="pt-32 px-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 ref={titleRef} className="text-6xl font-black font-display uppercase tracking-tighter mb-8">
                    Teams
                </h1>
                <p className="text-white/60 text-xl mb-12">
                    View and manage all registered teams across tournaments.
                </p>
                
                <div className="text-center py-20 border border-dashed border-white/20 rounded-2xl">
                    <p className="text-white/40 text-xl">
                        Teams are managed within individual tournaments.<br/>
                        Go to a tournament to view or register teams.
                    </p>
                </div>
            </div>
        </main>
    );
}
