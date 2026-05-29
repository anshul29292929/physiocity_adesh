import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmText = "Delete", 
    cancelText = "Cancel",
    isSubmitting = false,
    type = "danger" // "danger", "warning", "info"
}) => {
    
    const colors = {
        danger: {
            bg: "bg-red-50",
            icon: "text-red-500",
            btn: "bg-red-500 hover:bg-red-600 shadow-red-200",
            glow: "bg-red-50/50"
        },
        warning: {
            bg: "bg-amber-50",
            icon: "text-amber-500",
            btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
            glow: "bg-amber-50/50"
        },
        info: {
            bg: "bg-blue-50",
            icon: "text-blue-500",
            btn: "bg-blue-500 hover:bg-blue-600 shadow-blue-200",
            glow: "bg-blue-50/50"
        }
    };

    const style = colors[type] || colors.danger;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isSubmitting && onClose()}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-8">
                            <div className={`w-16 h-16 ${style.bg} rounded-full flex items-center justify-center ${style.icon} mb-6 mx-auto`}>
                                <AlertTriangle size={32} />
                            </div>
                            
                            <div className="text-center mb-10">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
                                <p className="text-slate-500 font-medium px-4">
                                    {message}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    disabled={isSubmitting}
                                    onClick={onClose}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all border border-slate-100"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    onClick={onConfirm}
                                    className={`flex-1 py-4 px-6 rounded-2xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${style.btn}`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {confirmText}
                                            {type === 'danger' && <Trash2 size={16} />}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Decorative background element */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${style.glow} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10`} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
