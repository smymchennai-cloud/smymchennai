import React from 'react';
import { ArrowRight, UserPlus } from 'lucide-react';

const RegisterSection = () => {
  return (
    <section id="register" className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <UserPlus className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Become a Member</h2>
          <p className="text-gray-600">Join our growing community and be part of something special</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-8 text-center">
          <p className="text-gray-600 mb-6">
            Ready to join SMYM Chennai? Open the full membership form on a dedicated page.
          </p>
          <a
            href="/member-registration"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition shadow-md hover:shadow-lg"
          >
            Open Membership Form
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;
