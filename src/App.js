import React, { useState, useEffect } from 'react';
import {
  Header,
  Footer,
  HeroSection,
  AboutSection,
  EventsSection,
  TeamSection,
  GallerySection,
  RegisterSection,
  GalleryModal,
  EventFlyerModal,
  EventRegistrationDrawer
} from './components';
import MemberRegistrationPage from './components/pages/MemberRegistrationPage';

const App = () => {
  const isMemberRegistrationPage = window.location.pathname === '/member-registration';
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [selectedEventFlyer, setSelectedEventFlyer] = useState(null);
  const [registrationEvent, setRegistrationEvent] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedEventFlyer(null);
        setSelectedGalleryImage(null);
      }
    };
    
    if (selectedEventFlyer || selectedGalleryImage) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedEventFlyer, selectedGalleryImage]);

  const scrollToSection = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isMemberRegistrationPage) {
    return <MemberRegistrationPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <Header 
        activeSection={activeSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        scrollToSection={scrollToSection}
      />

      {/* Hero Section */}
      <HeroSection scrollToSection={scrollToSection} />

      {/* About Section */}
      <AboutSection />

      {/* Events Section */}
      <EventsSection 
        onViewFlyer={setSelectedEventFlyer}
        onOpenRegistration={setRegistrationEvent}
      />

      {/* Team Section */}
      <TeamSection />

      {/* Gallery Section */}
      <GallerySection onImageSelect={setSelectedGalleryImage} />

      {/* Register Section */}
      <RegisterSection />

      {/* Footer */}
      <Footer />

      {/* Gallery Modal */}
      <GalleryModal 
        image={selectedGalleryImage} 
        onClose={() => setSelectedGalleryImage(null)} 
      />

      {/* Event Flyer Modal */}
      <EventFlyerModal 
        event={selectedEventFlyer} 
        onClose={() => setSelectedEventFlyer(null)} 
      />

      {/* Event Registration Drawer */}
      <EventRegistrationDrawer 
        isOpen={!!registrationEvent}
        event={registrationEvent}
        onClose={() => setRegistrationEvent(null)}
      />
    </div>
  );
};

export default App;
