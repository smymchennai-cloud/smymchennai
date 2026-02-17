import React from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import MemberRegistrationForm from '../forms/MemberRegistrationForm';

const MemberRegistrationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-800 font-semibold mb-8"
        >
          <ArrowLeft size={18} />
          Back to Home
        </a>

        <div className="text-center mb-10">
          <UserPlus className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Become a Member</h1>
          <p className="text-gray-600">Fill in the form below to complete your membership registration.</p>
        </div>

        <MemberRegistrationForm />
      </div>
    </div>
  );
};

export default MemberRegistrationPage;
