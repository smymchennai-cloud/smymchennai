import React, { useState } from 'react';
import { isValidMobile, isValidAge } from '../../utils/validators';
import { BANK_DETAILS, YES_NO_OPTIONS, PARTICIPANT_COUNT_OPTIONS } from '../../constants/formOptions';

const EventRegistrationForm = () => {
  const [eventRegData, setEventRegData] = useState({
    fullName: '',
    numberOfParticipants: '1',
    participants: [{ name: '', age: '', isMember: '', mobile: '' }],
    paymentScreenshot: null
  });

  const [eventRegTouched, setEventRegTouched] = useState({
    fullName: false,
    participants: [{ name: false, age: false, isMember: false, mobile: false }]
  });

  const markEventFieldTouched = (field) => {
    setEventRegTouched(prev => ({ ...prev, [field]: true }));
  };

  const markParticipantFieldTouched = (index, field) => {
    setEventRegTouched(prev => {
      const newParticipants = [...prev.participants];
      while (newParticipants.length <= index) {
        newParticipants.push({ name: false, age: false, isMember: false, mobile: false });
      }
      newParticipants[index] = { ...newParticipants[index], [field]: true };
      return { ...prev, participants: newParticipants };
    });
  };

  const handleParticipantCountChange = (count) => {
    const newCount = parseInt(count);
    const currentParticipants = [...eventRegData.participants];
    
    if (newCount > currentParticipants.length) {
      for (let i = currentParticipants.length; i < newCount; i++) {
        currentParticipants.push({ name: '', age: '', isMember: '', mobile: '' });
      }
    } else {
      currentParticipants.length = newCount;
    }
    
    setEventRegData({
      ...eventRegData,
      numberOfParticipants: count,
      participants: currentParticipants
    });
  };

  const updateParticipant = (index, field, value) => {
    const newParticipants = [...eventRegData.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setEventRegData({ ...eventRegData, participants: newParticipants });
  };

  const handleEventRegistrationSubmit = () => {
    if (!eventRegData.fullName) {
      alert('Please enter your full name');
      return;
    }
    
    for (let i = 0; i < eventRegData.participants.length; i++) {
      const p = eventRegData.participants[i];
      if (!p.name || !p.age || !p.isMember || !p.mobile) {
        alert(`Please fill all details for Participant ${i + 1}`);
        return;
      }
      if (!isValidAge(p.age)) {
        alert(`Participant ${i + 1}: Age must be between 18 and 40 years`);
        return;
      }
      if (!isValidMobile(p.mobile)) {
        alert(`Participant ${i + 1}: Mobile number must be 10 digits and not start with 0`);
        return;
      }
    }
    
    let summary = `Registration Details:\n\nFull Name: ${eventRegData.fullName}\nNumber of Participants: ${eventRegData.numberOfParticipants}\n\n`;
    
    eventRegData.participants.forEach((p, idx) => {
      summary += `Participant ${idx + 1}:\n`;
      summary += `  Name: ${p.name}\n`;
      summary += `  Age: ${p.age}\n`;
      summary += `  SMYM Member: ${p.isMember}\n`;
      summary += `  Mobile: ${p.mobile}\n\n`;
    });
    
    summary += 'You will now be redirected to the Google Form.\nPlease fill the same details and upload your payment screenshot there.';
    
    alert(summary);
    window.open('https://forms.gle/FE3hWS4FeEGGg8ox7', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Full Name */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
        <input
          type="text"
          value={eventRegData.fullName}
          onChange={(e) => setEventRegData({...eventRegData, fullName: e.target.value})}
          onBlur={() => markEventFieldTouched('fullName')}
          className={`w-full px-4 py-3 rounded-lg border ${eventRegTouched.fullName && !eventRegData.fullName ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
          placeholder="Enter your full name"
        />
        {eventRegTouched.fullName && !eventRegData.fullName && (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        )}
      </div>

      {/* Number of Participants */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Number of Participants *</label>
        <select
          value={eventRegData.numberOfParticipants}
          onChange={(e) => handleParticipantCountChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none bg-white"
        >
          {PARTICIPANT_COUNT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Participants Details */}
      {eventRegData.participants.map((participant, idx) => (
        <div key={idx} className="bg-orange-50 rounded-xl p-5 border border-orange-200">
          <h6 className="font-bold text-orange-700 mb-4 flex items-center">
            <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm mr-2">
              {idx + 1}
            </span>
            Participant {idx + 1}
          </h6>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">Name *</label>
              <input
                type="text"
                value={participant.name}
                onChange={(e) => updateParticipant(idx, 'name', e.target.value)}
                onBlur={() => markParticipantFieldTouched(idx, 'name')}
                className={`w-full px-3 py-2.5 rounded-lg border ${eventRegTouched.participants[idx]?.name && !participant.name ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
                placeholder="Participant name"
              />
              {eventRegTouched.participants[idx]?.name && !participant.name && (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">Age * <span className="font-normal text-gray-500">(18-40)</span></label>
                <input
                  type="number"
                  value={participant.age}
                  onChange={(e) => updateParticipant(idx, 'age', e.target.value)}
                  onBlur={() => markParticipantFieldTouched(idx, 'age')}
                  className={`w-full px-3 py-2.5 rounded-lg border ${(eventRegTouched.participants[idx]?.age && !participant.age) || (participant.age && !isValidAge(participant.age)) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
                  placeholder="Age"
                  min="18"
                  max="40"
                />
                {eventRegTouched.participants[idx]?.age && !participant.age ? (
                  <p className="text-xs text-red-500 mt-1">Required</p>
                ) : participant.age && !isValidAge(participant.age) ? (
                  <p className="text-xs text-red-500 mt-1">Must be 18-40</p>
                ) : null}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">SMYM Member *</label>
                <select
                  value={participant.isMember}
                  onChange={(e) => updateParticipant(idx, 'isMember', e.target.value)}
                  onBlur={() => markParticipantFieldTouched(idx, 'isMember')}
                  className={`w-full px-3 py-2.5 rounded-lg border ${eventRegTouched.participants[idx]?.isMember && !participant.isMember ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
                >
                  {YES_NO_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {eventRegTouched.participants[idx]?.isMember && !participant.isMember && (
                  <p className="text-xs text-red-500 mt-1">Required</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">Mobile Number *</label>
              <input
                type="tel"
                value={participant.mobile}
                onChange={(e) => updateParticipant(idx, 'mobile', e.target.value)}
                onBlur={() => markParticipantFieldTouched(idx, 'mobile')}
                className={`w-full px-3 py-2.5 rounded-lg border ${(eventRegTouched.participants[idx]?.mobile && !participant.mobile) || (participant.mobile && !isValidMobile(participant.mobile)) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
                placeholder="10 digit number"
                maxLength="10"
              />
              {eventRegTouched.participants[idx]?.mobile && !participant.mobile ? (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              ) : participant.mobile && !isValidMobile(participant.mobile) ? (
                <p className="text-xs text-red-500 mt-1">✗ Must be 10 digits, cannot start with 0</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">10 digits, should not start with 0</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Payment Details */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <h6 className="font-bold text-blue-700 mb-3 flex items-center">
          <span className="mr-2">💳</span>
          Payment Details
        </h6>
        <div className="text-sm space-y-2 text-gray-700">
          <p><span className="text-gray-500">Name:</span> <span className="font-medium">{BANK_DETAILS.name}</span></p>
          <p><span className="text-gray-500">Bank:</span> <span className="font-medium">{BANK_DETAILS.bank}</span></p>
          <p><span className="text-gray-500">Account No:</span> <span className="font-mono font-medium">{BANK_DETAILS.accountNumber}</span></p>
          <p><span className="text-gray-500">IFSC Code:</span> <span className="font-mono font-medium">{BANK_DETAILS.ifscCode}</span></p>
        </div>
        <p className="text-xs text-blue-600 mt-3 bg-blue-100 px-3 py-2 rounded-lg">
          💡 Pay via GPay / NEFT / Bank Transfer
        </p>
      </div>

      {/* Payment Screenshot */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Payment Screenshot *</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setEventRegData({...eventRegData, paymentScreenshot: e.target.files[0]})}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-600 file:font-semibold hover:file:bg-orange-200 file:cursor-pointer"
        />
        {eventRegData.paymentScreenshot && (
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <span className="mr-1">✓</span>
            {eventRegData.paymentScreenshot.name}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleEventRegistrationSubmit}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 transition shadow-lg hover:shadow-xl"
      >
        Submit Registration
      </button>
    </div>
  );
};

export default EventRegistrationForm;
