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
  EventFlyerModal
} from './components';
import MemberRegistrationPage from './components/pages/MemberRegistrationPage';
import Bulandi2026Page from './components/pages/Bulandi2026Page';
import Bulandi2026AdminPage from './components/pages/Bulandi2026AdminPage';
import { BULANDI_2026_ADMIN_PATH } from './data/bulandi2026Data';

const App = () => {
  const path = window.location.pathname;
  const isMemberRegistrationPage = path === '/member-registration';
  const isBulandi2026Page = path === '/bulandi-2026';
  const isBulandi2026AdminPage = path === BULANDI_2026_ADMIN_PATH;
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [selectedEventFlyer, setSelectedEventFlyer] = useState(null);
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

  if (isBulandi2026Page) {
    return <Bulandi2026Page />;
  }

  if (isBulandi2026AdminPage) {
    return <Bulandi2026AdminPage />;
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
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* Events Section */}
      <EventsSection 
        onViewFlyer={setSelectedEventFlyer}
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
        album={selectedGalleryImage} 
        onClose={() => setSelectedGalleryImage(null)} 
      />

      {/* Event Flyer Modal */}
      <EventFlyerModal 
        event={selectedEventFlyer} 
        onClose={() => setSelectedEventFlyer(null)} 
      />

    </div>
  );
};

export default App;
