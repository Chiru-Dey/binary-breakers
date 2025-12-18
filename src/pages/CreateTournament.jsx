import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { api } from '../services/api';

export default function CreateTournament() {
    const container = useRef();
    const titleRef = useRef();
    const formRef = useRef();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        game_type: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useGSAP(() => {
        const tl = gsap.timeline({ delay: 0.3 });
        
        if (titleRef.current) {
            tl.fromTo(titleRef.current, 
                { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
                { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.8, ease: 'power4.out' }
            );
        }
        if (formRef.current) {
            tl.from(formRef.current, {
                opacity: 0, y: 30, duration: 0.6, ease: 'power3.out'
            }, '-=0.3');
        }
    }, { scope: container });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.game_type) return;
        
        setIsSubmitting(true);
        try {
            const tournament = await api.createTournament(formData);
            navigate(`/tournaments/${tournament.id}`);
        } catch (error) {
            console.error('Failed to create tournament:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <main ref={container} className="pt-32 px-6 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <h1 ref={titleRef} className="text-6xl font-black font-display uppercase tracking-tighter mb-4">
                    Host Tournament
                </h1>
                <p className="text-white/60 text-xl mb-12">
                    Create a new tournament and start organizing your competition.
                </p>
                
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                            Tournament Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Summer Championship 2024"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white text-lg"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                            Game Type
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Valorant, League of Legends, CS2"
                            value={formData.game_type}
                            onChange={(e) => setFormData({...formData, game_type: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-lg focus:outline-none focus:border-brand-primary text-white text-lg"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-5 bg-brand-primary text-white font-bold text-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Tournament'}
                    </button>
                </form>
            </div>
        </main>
    );
}
