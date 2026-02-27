import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { isValidMobile, isValidEmail } from '../../utils/validators';
import { BANK_DETAILS, YES_NO_OPTIONS, PARTICIPANT_COUNT_OPTIONS } from '../../constants/formOptions';
import { CheckCircle, X, PartyPopper, Users } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbynFcaZ3LG9CTI5vWB0zc0thEISlFTSd-flcA2N9-iddEgHBz4v_NEbkNi4dxqws21e/exec';

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const SuccessModal = ({ isOpen, onClose, registrantName, isCashPayment, totalAmount }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0 }}>
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-animate-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden modal-animate-in mx-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
        >
          <X size={24} />
        </button>

        <div className={`p-8 text-center ${isCashPayment ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600' : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600'}`}>
          <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
            <CheckCircle className={`w-12 h-12 ${isCashPayment ? 'text-yellow-500' : 'text-green-500'}`} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="w-6 h-6 text-yellow-300" />
            <h2 className="text-2xl font-bold text-white">
              {isCashPayment ? 'Registration Submitted!' : 'Registration Successful!'}
            </h2>
            <PartyPopper className="w-6 h-6 text-yellow-300 scale-x-[-1]" />
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-700 text-lg mb-2">
            Thank you, <span className="font-semibold text-orange-600">{registrantName}</span>!
          </p>
          <p className="text-gray-600 mb-4">
            Your registration for <strong>Temple Run 2.0</strong> has been submitted.
          </p>
          
          {isCashPayment && (
            <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-300">
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                ⚠️ Important: Payment Pending
              </p>
              <p className="text-sm text-yellow-700">
                Your registration will be confirmed only after you make the payment of <strong>₹{totalAmount?.toLocaleString()}/-</strong>
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Please pay in cash to the event coordinator.
              </p>
            </div>
          )}
          
          <div className="bg-orange-50 rounded-xl p-4 mb-4 border border-orange-100">
            <p className="text-sm text-orange-700">
              <span className="font-semibold">🙏 Note:</span> Sacred 14-km Arunachala Pradakshina visiting eight Ashtalingams.
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
            <p className="text-sm text-green-700 mb-2">
              <span className="font-semibold">📱 Stay Updated:</span>
            </p>
            <p className="text-sm text-green-600">
              We will contact you with further details soon.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition shadow-md hover:shadow-lg"
            >
              Done
            </button>
            <p className="text-xs text-gray-400">
              We look forward to seeing you at Tiruvannamalai! 🙏
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const emptyParticipant = {
  name: '',
  age: '',
  isMember: '',
  mobile: ''
};

const TempleRunForm = () => {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    isMember: '',
    mobile: '',
    paymentMode: '',
    paymentScreenshot: null,
    numberOfParticipants: '1',
    participants: [{ ...emptyParticipant }]
  });

  const [touched, setTouched] = useState({
    email: false,
    fullName: false,
    isMember: false,
    mobile: false,
    paymentMode: false
  });

  const [participantsTouched, setParticipantsTouched] = useState([{
    name: false,
    age: false,
    isMember: false,
    mobile: false
  }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [wasCashPayment, setWasCashPayment] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState(0);

  const markFieldTouched = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const markParticipantFieldTouched = (index, field) => {
    setParticipantsTouched(prev => {
      const newTouched = [...prev];
      if (!newTouched[index]) {
        newTouched[index] = { name: false, age: false, isMember: false, mobile: false };
      }
      newTouched[index][field] = true;
      return newTouched;
    });
  };

  const isValidAge = (age) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 18;
  };

  const isValidName = (name) => {
    return name && !/\d/.test(name);
  };

  const handleParticipantCountChange = (count) => {
    const numCount = parseInt(count);
    const currentCount = formData.participants.length;
    
    let newParticipants = [...formData.participants];
    let newTouched = [...participantsTouched];
    
    if (numCount > currentCount) {
      for (let i = currentCount; i < numCount; i++) {
        newParticipants.push({ ...emptyParticipant });
        newTouched.push({ name: false, age: false, isMember: false, mobile: false });
      }
    } else if (numCount < currentCount) {
      newParticipants = newParticipants.slice(0, numCount);
      newTouched = newTouched.slice(0, numCount);
    }
    
    setFormData(prev => ({
      ...prev,
      numberOfParticipants: count,
      participants: newParticipants
    }));
    setParticipantsTouched(newTouched);
  };

  const updateParticipant = (index, field, value) => {
    setFormData(prev => {
      const newParticipants = [...prev.participants];
      newParticipants[index] = { ...newParticipants[index], [field]: value };
      return { ...prev, participants: newParticipants };
    });
  };

  const handleSubmit = async () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    if (!formData.fullName || !isValidName(formData.fullName)) {
      alert('Please enter a valid full name (no numbers allowed)');
      return;
    }
    
    if (!formData.isMember) {
      alert('Please select if you are an SMYM Member');
      return;
    }
    
    if (!formData.mobile || !isValidMobile(formData.mobile)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!formData.paymentMode) {
      alert('Please select your payment mode');
      return;
    }
    
    // Only require screenshot for non-cash payments
    if (formData.paymentMode !== 'Cash' && !formData.paymentScreenshot) {
      alert('Please upload your payment screenshot');
      return;
    }

    for (let i = 0; i < formData.participants.length; i++) {
      const p = formData.participants[i];
      if (!p.name || !isValidName(p.name)) {
        alert(`Participant ${i + 1}: Please enter a valid name (no numbers allowed)`);
        return;
      }
      if (!p.age || !isValidAge(p.age)) {
        alert(`Participant ${i + 1}: Age must be 18 or above`);
        return;
      }
      if (!p.isMember) {
        alert(`Participant ${i + 1}: Please select SMYM membership status`);
        return;
      }
      if (!p.mobile || !isValidMobile(p.mobile)) {
        alert(`Participant ${i + 1}: Please enter a valid 10-digit mobile number`);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      let base64Image = '';
      let imageName = '';
      
      if (formData.paymentScreenshot) {
        base64Image = await convertFileToBase64(formData.paymentScreenshot);
        imageName = formData.paymentScreenshot.name;
      }

      const sheetData = {
        timestamp: new Date().toISOString(),
        email: formData.email,
        fullName: formData.fullName,
        isMember: formData.isMember,
        mobile: formData.mobile,
        paymentMode: formData.paymentMode,
        paymentScreenshot: base64Image,
        paymentScreenshotName: imageName,
        numberOfParticipants: formData.numberOfParticipants,
        participants: formData.participants
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetData),
      });

      setSubmittedName(formData.fullName);
      setWasCashPayment(formData.paymentMode === 'Cash');
      setSubmittedAmount(totalAmount);
      setShowSuccessModal(true);
      setSubmitStatus('success');

      setFormData({
        email: '',
        fullName: '',
        isMember: '',
        mobile: '',
        paymentMode: '',
        paymentScreenshot: null,
        numberOfParticipants: '1',
        participants: [{ ...emptyParticipant }]
      });
      setTouched({
        email: false,
        fullName: false,
        isMember: false,
        mobile: false,
        paymentMode: false
      });
      setParticipantsTouched([{ name: false, age: false, isMember: false, mobile: false }]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      alert('There was an error submitting your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = parseInt(formData.numberOfParticipants) * 4000;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
        <div className="text-sm space-y-1 text-gray-700">
          <p>🙏 <strong>Registration Fee:</strong> ₹4,000/- per head</p>
          <p>📅 <strong>Date:</strong> 4th - 5th April 2026</p>
          <p>📍 <strong>Location:</strong> Tiruvannamalai</p>
          <p>🚶 <strong>Event:</strong> Sacred 14-km Arunachala Pradakshina</p>
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          onBlur={() => markFieldTouched('email')}
          className={`w-full px-4 py-3 rounded-lg border ${(touched.email && !formData.email) || (formData.email && !isValidEmail(formData.email)) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
          placeholder="Enter your email address"
        />
        {touched.email && !formData.email ? (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        ) : formData.email && !isValidEmail(formData.email) ? (
          <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
        ) : null}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => {
            const value = e.target.value.replace(/[0-9]/g, '');
            setFormData({...formData, fullName: value});
          }}
          onBlur={() => markFieldTouched('fullName')}
          className={`w-full px-4 py-3 rounded-lg border ${touched.fullName && !formData.fullName ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
          placeholder="Enter your full name"
        />
        {touched.fullName && !formData.fullName && (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">SMYM Member *</label>
        <select
          value={formData.isMember}
          onChange={(e) => setFormData({...formData, isMember: e.target.value})}
          onBlur={() => markFieldTouched('isMember')}
          className={`w-full px-4 py-3 rounded-lg border ${touched.isMember && !formData.isMember ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
        >
          {YES_NO_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {touched.isMember && !formData.isMember && (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Mobile Number * <span className="font-normal text-gray-500">(preferably WhatsApp)</span>
        </label>
        <input
          type="tel"
          value={formData.mobile}
          onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
          onBlur={() => markFieldTouched('mobile')}
          className={`w-full px-4 py-3 rounded-lg border ${(touched.mobile && !formData.mobile) || (formData.mobile && !isValidMobile(formData.mobile)) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
          placeholder="10 digit mobile number"
          maxLength="10"
        />
        {touched.mobile && !formData.mobile ? (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        ) : formData.mobile && !isValidMobile(formData.mobile) ? (
          <p className="text-xs text-red-500 mt-1">Must be 10 digits, cannot start with 0</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">10 digits, should not start with 0</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Number of Participants *</label>
        <select
          value={formData.numberOfParticipants}
          onChange={(e) => handleParticipantCountChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none bg-white"
        >
          {PARTICIPANT_COUNT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {formData.participants.map((participant, index) => (
        <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h6 className="font-bold text-gray-700 flex items-center">
              <Users className="w-5 h-5 mr-2 text-orange-600" />
              Participant {index + 1}
            </h6>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Name *</label>
              <input
                type="text"
                value={participant.name}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, '');
                  updateParticipant(index, 'name', value);
                }}
                onBlur={() => markParticipantFieldTouched(index, 'name')}
                className={`w-full px-4 py-3 rounded-lg border ${participantsTouched[index]?.name && !participant.name ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
                placeholder="Enter participant name"
              />
              {participantsTouched[index]?.name && !participant.name && (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Age * <span className="font-normal text-gray-500">(18 and above only)</span></label>
              <input
                type="number"
                value={participant.age}
                onChange={(e) => updateParticipant(index, 'age', e.target.value.replace(/\D/g, ''))}
                onBlur={() => markParticipantFieldTouched(index, 'age')}
                className={`w-full px-4 py-3 rounded-lg border ${(participantsTouched[index]?.age && !participant.age) || (participant.age && !isValidAge(participant.age)) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
                placeholder="Enter age"
                min="18"
              />
              {participantsTouched[index]?.age && !participant.age ? (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              ) : participant.age && !isValidAge(participant.age) ? (
                <p className="text-xs text-red-500 mt-1">Age must be 18 or above</p>
              ) : null}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">SMYM Member *</label>
              <select
                value={participant.isMember}
                onChange={(e) => updateParticipant(index, 'isMember', e.target.value)}
                onBlur={() => markParticipantFieldTouched(index, 'isMember')}
                className={`w-full px-4 py-3 rounded-lg border ${participantsTouched[index]?.isMember && !participant.isMember ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
              >
                {YES_NO_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {participantsTouched[index]?.isMember && !participant.isMember && (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Mobile Number *</label>
              <input
                type="tel"
                value={participant.mobile}
                onChange={(e) => updateParticipant(index, 'mobile', e.target.value.replace(/\D/g, ''))}
                onBlur={() => markParticipantFieldTouched(index, 'mobile')}
                className={`w-full px-4 py-3 rounded-lg border ${(participantsTouched[index]?.mobile && !participant.mobile) || (participant.mobile && !isValidMobile(participant.mobile)) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
                placeholder="10 digit mobile number"
                maxLength="10"
              />
              {participantsTouched[index]?.mobile && !participant.mobile ? (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              ) : participant.mobile && !isValidMobile(participant.mobile) ? (
                <p className="text-xs text-red-500 mt-1">Must be 10 digits, cannot start with 0</p>
              ) : null}
            </div>
          </div>
        </div>
      ))}

      {/* Payment Details Section */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <h6 className="font-bold text-blue-700 mb-3 flex items-center">
          <span className="mr-2">💳</span>
          Bank Details for Payment - ₹4,000/- per head
        </h6>
        <div className="text-sm space-y-2 text-gray-700">
          <p><span className="text-gray-500">Name:</span> <span className="font-medium">{BANK_DETAILS.name}</span></p>
          <p><span className="text-gray-500">Bank:</span> <span className="font-medium">{BANK_DETAILS.bank}</span></p>
          <p><span className="text-gray-500">Account No:</span> <span className="font-mono font-medium">{BANK_DETAILS.accountNumber}</span></p>
          <p><span className="text-gray-500">IFSC Code:</span> <span className="font-mono font-medium">{BANK_DETAILS.ifscCode}</span></p>
        </div>
        <p className="text-xs text-blue-600 mt-3 bg-blue-100 px-3 py-2 rounded-lg">
          💡 Please pay via GPay or NEFT
        </p>
        <p className="text-sm font-semibold text-orange-600 mt-3">
          Total Amount: ₹{totalAmount.toLocaleString()}/-
        </p>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Payment Mode *</label>
        <select
          value={formData.paymentMode}
          onChange={(e) => {
            setFormData({...formData, paymentMode: e.target.value, paymentScreenshot: null});
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          onBlur={() => markFieldTouched('paymentMode')}
          className={`w-full px-4 py-3 rounded-lg border ${touched.paymentMode && !formData.paymentMode ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none bg-white`}
        >
          <option value="">-- Select Payment Mode --</option>
          <option value="Gpay">Gpay</option>
          <option value="NEFT">NEFT</option>
          <option value="Cash">Cash</option>
        </select>
        {touched.paymentMode && !formData.paymentMode && (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        )}
        {formData.paymentMode === 'Cash' && (
          <p className="text-xs text-yellow-600 mt-1 bg-yellow-50 p-2 rounded">
            ⚠️ Registration will be confirmed only after cash payment is received.
          </p>
        )}
      </div>

      {formData.paymentMode && formData.paymentMode !== 'Cash' && (
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Payment Screenshot *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({...formData, paymentScreenshot: e.target.files[0]})}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-600 file:font-semibold hover:file:bg-orange-200 file:cursor-pointer"
          />
          {formData.paymentScreenshot && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <span className="mr-1">✓</span>
              {formData.paymentScreenshot.name}
            </p>
          )}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold">✗ Submission failed</p>
          <p className="text-sm mt-1">Please try again.</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl ${
          isSubmitting 
            ? 'opacity-70 cursor-not-allowed' 
            : 'hover:from-orange-700 hover:to-amber-700'
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
          `Submit Registration (₹${totalAmount.toLocaleString()})`
        )}
      </button>

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSubmitStatus(null);
          setWasCashPayment(false);
        }}
        registrantName={submittedName}
        isCashPayment={wasCashPayment}
        totalAmount={submittedAmount}
      />
    </div>
  );
};

export default TempleRunForm;
