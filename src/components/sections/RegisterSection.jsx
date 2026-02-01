import React from 'react';
import { UserPlus } from 'lucide-react';
import MemberRegistrationForm from '../forms/MemberRegistrationForm';

const RegisterSection = () => {
  return (
    <section id="register" className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <UserPlus className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Become a Member</h2>
          <p className="text-gray-600">Join our growing community and be part of something special</p>
        </div>

        <MemberRegistrationForm />
      </div>
    </section>
  );
};

export default RegisterSection;
