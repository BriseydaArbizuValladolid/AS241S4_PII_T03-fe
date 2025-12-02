import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const DetailModal = ({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className={`relative bg-white rounded-xl shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-hidden animate-fadeIn`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors text-gray-700"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-white">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-6 border-t border-gray-300 bg-gray-100">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;

