import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop con glassmorphism intenso */}
            <div
                className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col transition-all duration-300 z-10 mb-24`}>
                <div className="relative flex flex-col w-full bg-white dark:bg-slate-900 border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 shrink-0">
                        <h2 className="text-xl font-semibold text-rosa-oscuro dark:text-rosa-primario">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 dark:text-gray-400 hover:text-rosa-oscuro dark:hover:text-rosa-primario transition-colors p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 text-gray-900 dark:text-gray-100 overflow-y-auto custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
