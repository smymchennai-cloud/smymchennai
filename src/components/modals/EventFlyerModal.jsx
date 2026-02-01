import React from 'react';
import { X, Calendar, MapPin } from 'lucide-react';

const EventFlyerModal = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full bg-white rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full z-10 hover:bg-white transition"
        >
          <X size={24} />
        </button>
        {event.flyer && (
          <img 
            src={event.flyer} 
            alt={event.name}
            className="w-full object-contain"
          />
        )}
        <div className="p-6">
          <h3 className="font-bold text-2xl text-gray-800 mb-2">{event.name}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(event.date).toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            {event.time && <span className="ml-2">at {event.time}</span>}
          </div>
          {event.venue && (
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{event.venue}</span>
            </div>
          )}
          {event.description && (
            <p className="text-gray-600 mt-4">{event.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventFlyerModal;
