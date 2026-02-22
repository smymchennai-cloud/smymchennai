import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { isValidMobile, isValidEmail } from '../../utils/validators';
import { BANK_DETAILS, YES_NO_OPTIONS } from '../../constants/formOptions';
import { CheckCircle, X, PartyPopper, MessageCircle } from 'lucide-react';

// UPDATE THIS URL after deploying your Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2C0RyLbfizFCDRlw9KuFNyUgIh1wk38vkVBJdgIsPyjw2rCZWFLEBXdfv-0hOtSkB/exec';

// Helper function to convert file to Base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, registrantName }) => {
  if (!isOpen) return null;

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
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 p-8 text-center">
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
            Thank you, <span className="font-semibold text-purple-600">{registrantName}</span>!
          </p>
          <p className="text-gray-600 mb-4">
            Your registration for <strong>Quietly Powerful</strong> has been submitted successfully.
          </p>
          
          <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-100">
            <p className="text-sm text-purple-700">
              <span className="font-semibold">💜 Note:</span> Registration amount will be refunded to all SMYM Members on attendance.
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
            <p className="text-sm text-green-700 mb-2">
              <span className="font-semibold">📱 Join WhatsApp Group for Updates:</span>
            </p>
            <a 
              href="https://chat.whatsapp.com/JGXwuAfEIhc9P4aRy9Fugx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Click here to join
            </a>
          </div>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition shadow-md hover:shadow-lg"
            >
              Done
            </button>
            <p className="text-xs text-gray-400">
              We look forward to seeing you at the event! 💜
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const QuietlyPowerfulForm = () => {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    isMember: '',
    mobile: '',
    paymentMode: '',
    paymentScreenshot: null,
    age: ''
  });

  const [touched, setTouched] = useState({
    email: false,
    fullName: false,
    isMember: false,
    mobile: false,
    paymentMode: false,
    age: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const markFieldTouched = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isValidAge = (age) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 1 && ageNum <= 100;
  };

  const handleSubmit = async () => {
    // Validate all fields
    if (!formData.email || !isValidEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    if (!formData.fullName) {
      alert('Please enter your full name');
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
      alert('Please select your payment mode (Gpay/NEFT)');
      return;
    }
    
    if (!formData.paymentScreenshot) {
      alert('Please upload your payment screenshot');
      return;
    }
    
    if (!formData.age || !isValidAge(formData.age)) {
      alert('Please enter a valid age');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Convert image to Base64
      let base64Image = '';
      let imageName = '';
      
      if (formData.paymentScreenshot) {
        base64Image = await convertFileToBase64(formData.paymentScreenshot);
        imageName = formData.paymentScreenshot.name;
      }

      // Prepare data for Google Sheets (matching sheet column order)
      const sheetData = {
        timestamp: new Date().toISOString(),
        email: formData.email,
        fullName: formData.fullName,
        isMember: formData.isMember,
        mobile: formData.mobile,
        paymentMode: formData.paymentMode,
        paymentScreenshot: base64Image,
        paymentScreenshotName: imageName,
        age: formData.age,
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
      setSubmittedName(formData.fullName);
      
      // Show success modal
      setShowSuccessModal(true);
      setSubmitStatus('success');

      // Reset form
      setFormData({
        email: '',
        fullName: '',
        isMember: '',
        mobile: '',
        paymentMode: '',
        paymentScreenshot: null,
        age: ''
      });
      setTouched({
        email: false,
        fullName: false,
        isMember: false,
        mobile: false,
        paymentMode: false,
        age: false
      });
      
      // Reset file input
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

  return (
    <div className="space-y-6">
      {/* Event Info Banner */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-purple-200">
        <div className="text-sm space-y-1 text-gray-700">
          <p>💜 <strong>Registration Fee:</strong> ₹500/- (Members & Non-Members)</p>
          <p>✨ <strong>Refund Policy:</strong> Amount refunded to SMYM Members on attendance</p>
          <p>⚡ <strong>Limited Entries:</strong> First come, first serve basis</p>
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          onBlur={() => markFieldTouched('email')}
          className={`w-full px-4 py-3 rounded-lg border ${(touched.email && !formData.email) || (formData.email && !isValidEmail(formData.email)) ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none bg-white`}
          placeholder="Enter your email address"
        />
        {touched.email && !formData.email ? (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        ) : formData.email && !isValidEmail(formData.email) ? (
          <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
        ) : null}
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          onBlur={() => markFieldTouched('fullName')}
          className={`w-full px-4 py-3 rounded-lg border ${touched.fullName && !formData.fullName ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none bg-white`}
          placeholder="Enter your full name"
        />
        {touched.fullName && !formData.fullName && (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        )}
      </div>

      {/* SMYM Member */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">SMYM Member (Yes or No) *</label>
        <select
          value={formData.isMember}
          onChange={(e) => setFormData({...formData, isMember: e.target.value})}
          onBlur={() => markFieldTouched('isMember')}
          className={`w-full px-4 py-3 rounded-lg border ${touched.isMember && !formData.isMember ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none bg-white`}
        >
          {YES_NO_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {touched.isMember && !formData.isMember && (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        )}
      </div>

      {/* Mobile Number */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Mobile Number * <span className="font-normal text-gray-500">(preferably WhatsApp)</span>
        </label>
        <input
          type="tel"
          value={formData.mobile}
          onChange={(e) => setFormData({...formData, mobile: e.target.value})}
          onBlur={() => markFieldTouched('mobile')}
          className={`w-full px-4 py-3 rounded-lg border ${(touched.mobile && !formData.mobile) || (formData.mobile && !isValidMobile(formData.mobile)) ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none bg-white`}
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

      {/* Payment Details */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <h6 className="font-bold text-blue-700 mb-3 flex items-center">
          <span className="mr-2">💳</span>
          Payment Details - ₹500/-
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

      {/* Payment Mode */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Payment Mode *</label>
        <select
          value={formData.paymentMode}
          onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
          onBlur={() => markFieldTouched('paymentMode')}
          className={`w-full px-4 py-3 rounded-lg border ${touched.paymentMode && !formData.paymentMode ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none bg-white`}
        >
          <option value="">-- Select Payment Mode --</option>
          <option value="Gpay">Gpay</option>
          <option value="NEFT">NEFT</option>
        </select>
        {touched.paymentMode && !formData.paymentMode && (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        )}
      </div>

      {/* Payment Screenshot */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Payment Screenshot *</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({...formData, paymentScreenshot: e.target.files[0]})}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-600 file:font-semibold hover:file:bg-purple-200 file:cursor-pointer"
        />
        {formData.paymentScreenshot && (
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <span className="mr-1">✓</span>
            {formData.paymentScreenshot.name}
          </p>
        )}
      </div>

      {/* Age */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Age *</label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({...formData, age: e.target.value})}
          onBlur={() => markFieldTouched('age')}
          className={`w-full px-4 py-3 rounded-lg border ${(touched.age && !formData.age) || (formData.age && !isValidAge(formData.age)) ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none bg-white`}
          placeholder="Enter your age"
          min="1"
          max="100"
        />
        {touched.age && !formData.age ? (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        ) : formData.age && !isValidAge(formData.age) ? (
          <p className="text-xs text-red-500 mt-1">Please enter a valid age</p>
        ) : null}
      </div>

      {/* Error Status */}
      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold">✗ Submission failed</p>
          <p className="text-sm mt-1">Please try again.</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl ${
          isSubmitting 
            ? 'opacity-70 cursor-not-allowed' 
            : 'hover:from-pink-700 hover:to-purple-700'
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

export default QuietlyPowerfulForm;
