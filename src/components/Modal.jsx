import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    const modalRef = useRef();

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === modalRef.current) onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            ref={modalRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
            <div className="relative w-full max-w-lg mx-4 bg-brand-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold font-display">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xl"
                    >
                        ✕
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
