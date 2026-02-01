import React from 'react';
import { Users } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Users className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">About Us</h2>
          <p className="text-gray-600">Building a stronger community through unity and purpose</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Journey</h3>
          <div className="prose prose-lg text-gray-600 space-y-4">
            <p>
              Founded in 1985, Shree Maheshwari Yuva Mandal, Chennai has been a cornerstone of the Maheshwari community in Chennai for over three decades. What began as a small gathering of passionate young individuals has blossomed into a thriving organization with over 1100 active members.
            </p>
            <p>
              Our mission has always been clear: to nurture young talent, preserve our rich cultural heritage, and contribute meaningfully to society. Through countless cultural programs, educational initiatives, and social welfare activities, we have touched thousands of lives and created lasting impact.
            </p>
            <p>
              Today, we stand as one of the most vibrant youth organizations in Chennai, continuing to inspire, connect, and empower the next generation of leaders.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center p-4 bg-white rounded-xl shadow">
              <div className="text-3xl font-bold text-orange-600">1100+</div>
              <div className="text-gray-600">Members</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow">
              <div className="text-3xl font-bold text-orange-600">39</div>
              <div className="text-gray-600">Years</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow">
              <div className="text-3xl font-bold text-orange-600">12+</div>
              <div className="text-gray-600 text-sm">Events (Last 12 Months)</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow">
              <div className="text-3xl font-bold text-orange-600">1000+</div>
              <div className="text-gray-600">Lives Touched</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
