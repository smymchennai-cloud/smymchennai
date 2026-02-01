import React from 'react';
import { Users } from 'lucide-react';
import { officeBearers, executiveMembers, advisors } from '../../data/teamData';

const MemberCard = ({ member, size = 'normal' }) => {
  const sizeClasses = {
    normal: 'bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition',
    small: 'bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition'
  };

  const textClasses = {
    normal: {
      name: 'font-bold text-gray-800 mb-1',
      position: 'text-sm text-orange-600'
    },
    small: {
      name: 'font-semibold text-gray-800 text-sm mb-1',
      position: 'text-xs text-orange-600'
    }
  };

  return (
    <div className={sizeClasses[size]}>
      {member.photo ? (
        <img 
          src={member.photo} 
          alt={member.name}
          className={`${size === 'normal' ? 'w-20 h-20' : 'w-14 h-14'} rounded-full mx-auto mb-4 object-cover border-2 border-orange-400`}
        />
      ) : (
        <div className={`${size === 'normal' ? 'w-20 h-20' : 'w-14 h-14'} bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center`}>
          <span className="text-white text-xl font-bold">
            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
      )}
      <h4 className={textClasses[size].name}>{member.name}</h4>
      <p className={textClasses[size].position}>{member.position}</p>
    </div>
  );
};

const TeamSection = () => {
  return (
    <section id="team" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Our Leadership</h2>
        <p className="text-center text-gray-600 mb-12">Meet the dedicated individuals guiding our organization</p>
        
        {/* Office Bearers */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
            <Users className="mr-2 text-orange-600" />
            Office Bearers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {officeBearers.map((member, idx) => (
              <MemberCard key={idx} member={member} />
            ))}
          </div>
        </div>

        {/* Executive Committee Members */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center">
            <Users className="mr-2 text-orange-600" />
            Executive Committee Members
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {executiveMembers.map((member, idx) => (
              <MemberCard key={idx} member={member} size="small" />
            ))}
          </div>
        </div>

        {/* Advisors */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center">
            <Users className="mr-2 text-orange-600" />
            Advisors
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {advisors.map((member, idx) => (
              <MemberCard key={idx} member={member} size="small" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
