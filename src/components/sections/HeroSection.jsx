import React from 'react';
import { ChevronRight } from 'lucide-react';
import { BULANDI_2026_LINKS } from '../../data/bulandi2026Data';

const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm scale-105"
        style={{ backgroundImage: 'url(/photos/group-pic.png)' }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/80 via-white/70 to-red-100/80" />

      {/* Content */}
      <div className="text-center max-w-4xl relative z-10">
        <img
          src="/smym-logo-no-bg.png"
          alt="SMYM Chennai Logo"
          className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto mb-6"
        />
        <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
          Shree Maheshwari Yuva Mandal, Chennai
        </h2>
        <p className="text-sm text-gray-600 mb-6">(under the patronage of Shree Maheshwari Sabha, Chennai)</p>
        <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-8">
          Empowering Youth, Building Community
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/member-registration';
            }}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition flex items-center justify-center"
          >
            Join Us Today
            <ChevronRight className="ml-2" />
          </button>

          <a
            href={BULANDI_2026_LINKS.bulandiRegistration}
            className="inline-flex items-center justify-center bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:brightness-105 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-50/90">
            Join Bulandi 2026
            <ChevronRight className="ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
