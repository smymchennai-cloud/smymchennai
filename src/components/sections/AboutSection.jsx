import React from 'react';
import { Users } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Users className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">About Us</h2>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 shadow-lg">
          <div className="prose prose-lg text-gray-600 text-justify">
            <p>
              Founded in 1980 as the Maheshwari Youth Club, Shree Maheshwari Yuva Mandal received formal recognition in 1985 from Shree Maheshwari Sabha, Chennai, as the official youth association of the Maheshwari community. What began as a small collective of committed youngsters has since grown into a structured and vibrant platform focused on youth engagement, cultural continuity, and community service.
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
