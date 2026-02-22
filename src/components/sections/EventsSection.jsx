import React from 'react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { upcomingEvents, pastEvents } from '../../data/eventsData';

// Get styling based on event status
const getEventStatusStyle = (status) => {
  switch (status) {
    case 'Coming Soon':
      return {
        card: 'bg-gradient-to-br from-green-50 to-emerald-100 border-l-4 border-green-500',
        badge: 'bg-green-100 text-green-700',
        opacity: ''
      };
    case 'Registrations Closed':
      return {
        card: 'bg-gradient-to-br from-gray-100 to-gray-200 border-l-4 border-gray-400',
        badge: 'bg-red-100 text-red-600',
        opacity: 'opacity-75'
      };
    case 'Save the Date':
      return {
        card: 'bg-gradient-to-br from-purple-50 to-violet-100 border-l-4 border-purple-500',
        badge: 'bg-purple-100 text-purple-700',
        opacity: ''
      };
    default:
      return {
        card: 'bg-gradient-to-br from-orange-50 to-amber-100 border-l-4 border-orange-500',
        badge: 'bg-orange-100 text-orange-600',
        opacity: ''
      };
  }
};

const EventsSection = ({ onViewFlyer, onOpenRegistration }) => {
  return (
    <section id="events" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Calendar className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Events</h2>
          <p className="text-gray-600">Stay connected with our vibrant community activities</p>
        </div>

        {/* Legend for status colors */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-gray-600">Coming Soon</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            <span className="text-gray-600">Save the Date</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
            <span className="text-gray-600">Registrations Closed</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 bg-amber-700 rounded-full mr-2"></span>
            <span className="text-gray-600">Past Events</span>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Calendar className="mr-2 text-orange-600" />
            Upcoming Events
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => {
              const statusStyle = getEventStatusStyle(event.status);
              
              return (
                <div 
                  key={event.id} 
                  className={`rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition ${statusStyle.card}`}
                >
                  <div className="p-6">
                    <div className={statusStyle.opacity}>
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-xl text-gray-800">{event.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusStyle.badge}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-gray-600 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center">
                            <span className="w-4 h-4 mr-2 text-center">🕐</span>
                            <span>{event.time}</span>
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{event.venue}</span>
                          </div>
                        )}
                        {event.description && (
                          <p className="text-gray-500 mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {event.flyer && (
                        <button
                          onClick={() => onViewFlyer(event)}
                          className="flex-1 bg-white text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition text-sm shadow-sm"
                        >
                          View Details
                        </button>
                      )}
                      {event.name === 'Quietly Powerful' && (
                        <button
                          onClick={() => onOpenRegistration(event)}
                          className="flex-1 py-2 rounded-lg font-semibold transition flex items-center justify-center text-sm bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700"
                        >
                          Register Now
                          <ChevronRight className="ml-1 w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Calendar className="mr-2 text-amber-700" />
            Past Events in 12 months
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event, idx) => (
              <div 
                key={idx} 
                className="bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-700 rounded-xl shadow-lg p-5 hover:shadow-xl transition"
              >
                <h4 className="font-bold text-gray-800 mb-2">{event.name}</h4>
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 font-semibold">{event.attendees} Participants</span>
                </div>
                {event.coordinator && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">Coordinator:</span> {event.coordinator}
                  </p>
                )}
                {event.specialMention && (
                  <p className="text-xs text-orange-600 mt-1">
                    <span className="font-medium">Special Mention:</span> {event.specialMention}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
