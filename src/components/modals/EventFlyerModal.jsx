import React from 'react';
import { X } from 'lucide-react';

const EventFlyerModal = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 bg-white/90 p-2 rounded-full z-10 hover:bg-white transition shadow-lg"
        >
          <X size={24} />
        </button>
        
        {/* Image Only */}
        {event.flyer && (
          <img 
            src={event.flyer} 
            alt={event.name}
            className="w-full h-auto object-contain rounded-xl shadow-2xl"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          />
        )}
      </div>
    </div>
  );
};

export default EventFlyerModal;
