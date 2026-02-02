import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { isValidMobile, isValidAge, isValidEmail } from '../../utils/validators';
import { BANK_DETAILS, YES_NO_OPTIONS, PARTICIPANT_COUNT_OPTIONS } from '../../constants/formOptions';
import { CheckCircle, X, PartyPopper } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw4PA4qYx979f9y7ZSB99HmLDeS1Yk9iuDhrPFE-G2NIST-sL_VbzHSzgjBiJigY6nW/exec';

// Helper function to convert file to Base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Success Modal Component - Uses Portal to render at document body
const SuccessModal = ({ isOpen, onClose, registrantName }) => {
  if (!isOpen) return null;

  // Render modal in a portal at the document body level for true centering
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-animate-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden modal-animate-in mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
        >
          <X size={24} />
        </button>

        {/* Success gradient header */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="w-6 h-6 text-yellow-300" />
            <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
            <PartyPopper className="w-6 h-6 text-yellow-300 scale-x-[-1]" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-gray-700 text-lg mb-2">
            Thank you, <span className="font-semibold text-orange-600">{registrantName}</span>!
          </p>
          <p className="text-gray-600 mb-4">
            Your registration has been submitted successfully along with your payment screenshot.
          </p>
          
          <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-100">
            <p className="text-sm text-orange-700">
              <span className="font-semibold">📧 Confirmation:</span> You will receive updates on your registered email address.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition shadow-md hover:shadow-lg"
            >
              Done
            </button>
            <p className="text-xs text-gray-400">
              We look forward to seeing you at the event! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const EventRegistrationForm = () => {
  const fileInputRef = useRef(null);
  
  const [eventRegData, setEventRegData] = useState({
    email: '',
    fullName: '',
    numberOfParticipants: '1',
    participants: [{ name: '', age: '', isMember: '', mobile: '' }],
    paymentScreenshot: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const [eventRegTouched, setEventRegTouched] = useState({
    email: false,
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

  const handleEventRegistrationSubmit = async () => {
    // Validate email
    if (!eventRegData.email || !isValidEmail(eventRegData.email)) {
      alert('Please enter a valid email address');
      return;
    }

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

    // Validate payment screenshot
    if (!eventRegData.paymentScreenshot) {
      alert('Please upload your payment screenshot');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Convert image to Base64
      let base64Image = '';
      let imageName = '';
      
      if (eventRegData.paymentScreenshot) {
        base64Image = await convertFileToBase64(eventRegData.paymentScreenshot);
        imageName = eventRegData.paymentScreenshot.name;
      }

      // Prepare data for Google Sheets
      const sheetData = {
        timestamp: new Date().toISOString(),
        email: eventRegData.email,
        fullName: eventRegData.fullName,
        numberOfParticipants: eventRegData.numberOfParticipants,
        participant1Name: eventRegData.participants[0]?.name || '',
        participant1Age: eventRegData.participants[0]?.age || '',
        participant1Member: eventRegData.participants[0]?.isMember || '',
        participant1Mobile: eventRegData.participants[0]?.mobile || '',
        participant2Name: eventRegData.participants[1]?.name || '',
        participant2Age: eventRegData.participants[1]?.age || '',
        participant2Member: eventRegData.participants[1]?.isMember || '',
        participant2Mobile: eventRegData.participants[1]?.mobile || '',
        participant3Name: eventRegData.participants[2]?.name || '',
        participant3Age: eventRegData.participants[2]?.age || '',
        participant3Member: eventRegData.participants[2]?.isMember || '',
        participant3Mobile: eventRegData.participants[2]?.mobile || '',
        paymentScreenshot: base64Image,
        paymentScreenshotName: imageName,
      };

      // Submit to Google Apps Script
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetData),
      });

      // Store the name before resetting
      setSubmittedName(eventRegData.fullName);
      
      // Show success modal
      setShowSuccessModal(true);
      setSubmitStatus('success');

      // Reset form
      setEventRegData({
        email: '',
        fullName: '',
        numberOfParticipants: '1',
        participants: [{ name: '', age: '', isMember: '', mobile: '' }],
        paymentScreenshot: null
      });
      setEventRegTouched({
        email: false,
        fullName: false,
        participants: [{ name: false, age: false, isMember: false, mobile: false }]
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      alert('There was an error submitting your registration. Please try again or use the Google Form directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Address */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
        <input
          type="email"
          value={eventRegData.email}
          onChange={(e) => setEventRegData({...eventRegData, email: e.target.value})}
          onBlur={() => markEventFieldTouched('email')}
          className={`w-full px-4 py-3 rounded-lg border ${(eventRegTouched.email && !eventRegData.email) || (eventRegData.email && !isValidEmail(eventRegData.email)) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
          placeholder="Enter your email address"
        />
        {eventRegTouched.email && !eventRegData.email ? (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        ) : eventRegData.email && !isValidEmail(eventRegData.email) ? (
          <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
        ) : null}
      </div>

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
          ref={fileInputRef}
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

      {/* Error Status */}
      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold">✗ Submission failed</p>
          <p className="text-sm mt-1">Please try again or use the Google Form directly.</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleEventRegistrationSubmit}
        disabled={isSubmitting}
        className={`w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl ${
          isSubmitting 
            ? 'opacity-70 cursor-not-allowed' 
            : 'hover:from-orange-700 hover:to-red-700'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Registration'
        )}
      </button>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSubmitStatus(null);
        }}
        registrantName={submittedName}
      />
    </div>
  );
};

export default EventRegistrationForm;
