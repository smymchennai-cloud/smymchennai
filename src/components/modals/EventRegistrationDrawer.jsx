import React, { useEffect } from 'react';
import { X, Calendar, MapPin } from 'lucide-react';
import EventRegistrationForm from '../forms/EventRegistrationForm';

const EventRegistrationDrawer = ({ isOpen, onClose, event }) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[520px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Event Registration</h2>
              <h3 className="text-lg font-semibold opacity-90">{event.name}</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Event Details */}
          <div className="mt-4 space-y-2 text-sm opacity-90">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {new Date(event.date).toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
                {event.time && ` at ${event.time}`}
              </span>
            </div>
            {event.venue && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.venue}</span>
              </div>
            )}
            {event.description && (
              <p className="mt-2 text-white/80">{event.description}</p>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto h-[calc(100%-200px)] p-6">
          <EventRegistrationForm />
        </div>
      </div>
    </>
  );
};

export default EventRegistrationDrawer;
