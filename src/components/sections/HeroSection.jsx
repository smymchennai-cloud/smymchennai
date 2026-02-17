import React from 'react';
import { ChevronRight } from 'lucide-react';

const HeroSection = ({ scrollToSection }) => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-red-100 pt-20 px-4">
      <div className="text-center max-w-4xl">
        <img 
          src="/smym-logo-no-bg.png" 
          alt="SMYM Chennai Logo" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto mb-6"
        />
        <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
          Shree Maheshwari Yuva Mandal, Chennai
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          (under the patronage of Shree Maheshwari Sabha, Chennai)
        </p>
        <p className="text-xl text-gray-600 mb-8">
          Empowering Youth, Building Community
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              window.location.href = '/member-registration';
            }}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition flex items-center justify-center"
          >
            Join Us Today
            <ChevronRight className="ml-2" />
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
