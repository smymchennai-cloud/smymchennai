import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';

const HeroSection = ({ scrollToSection }) => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm scale-105"
        style={{ backgroundImage: 'url(/photos/group-pic.png)' }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/80 via-white/70 to-red-100/80" />
      
      {/* Bulandi Flash Banner - Top Right with Thunder Effect */}
      <div className="absolute top-24 right-4 md:right-8 z-20 group">
        {/* Outer Glow Animation */}
        <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur-xl opacity-75 animate-pulse" />
        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 rounded-2xl blur-md animate-ping opacity-40" />
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-1 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.6)]">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden">
            {/* Electric Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.1),transparent_70%)]" />
            
            {/* Lightning Bolt Left */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 animate-bounce">
              <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
            </div>
            
            <img 
              src="/bulandi.png" 
              alt="Bulandi 2026" 
              className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.7)] ml-4"
            />
            <div className="text-left relative z-10">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
                  Save the Date
                </span>
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>
              <p className="font-extrabold text-white text-sm md:text-lg tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                Bulandi is Back!
              </p>
              <p className="text-yellow-400 font-bold text-xs md:text-sm drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
                ⚡ July 2026 ⚡
              </p>
            </div>
            
            {/* Lightning Bolt Right */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.3s' }}>
              <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
            </div>
          </div>
        </div>
        
        {/* Extra Lightning Sparks */}
        <div className="absolute -top-2 left-1/4 animate-ping">
          <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
        </div>
        <div className="absolute -bottom-2 right-1/4 animate-ping" style={{ animationDelay: '0.5s' }}>
          <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
        </div>
      </div>
      
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
        <p className="text-sm text-gray-600 mb-6">
          (under the patronage of Shree Maheshwari Sabha, Chennai)
        </p>
        <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-8">
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
