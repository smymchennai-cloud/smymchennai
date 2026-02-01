import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { 
  validatePhone, 
  validateEmail, 
  validateDobAge18, 
  validateNotFutureDate,
  getTodayDate,
  getMaxDobFor18Plus 
} from '../../utils/validators';
import { 
  BLOOD_GROUPS, 
  GENDER_OPTIONS, 
  YES_NO_OPTIONS, 
  MEMBERSHIP_STATUS,
  KIDS_COUNT_OPTIONS 
} from '../../constants/formOptions';

const MemberRegistrationForm = () => {
  const [formData, setFormData] = useState({
    membershipStatus: 'New Registration',
    surname: '',
    name: '',
    photo: null,
    gender: '',
    dob: '',
    qualification: '',
    occupation: '',
    fatherName: '',
    bloodGroup: '',
    willingToDonate: '',
    married: '',
    // Spouse details (conditional)
    dateOfMarriage: '',
    spouseName: '',
    spousePhone: '',
    spouseDob: '',
    spouseQualification: '',
    spouseBloodGroup: '',
    isSpouseMember: '',
    numberOfKids: '0',
    kids: [],
    // Contact Details
    contactEmail: '',
    whatsappNumber: '',
    contactNumber: '',
    addressResi: '',
    phoneLandline: '',
    addressOffice: '',
    phoneOffice: '',
    // Other Details
    hobbies: '',
    isMaheshwariSabhaMember: '',
    isOtherClubMember: '',
    otherClubNames: '',
    // Declarations
    declarationA: false,
    declarationB: false
  });

  const [fieldErrors, setFieldErrors] = useState({
    whatsappNumber: '',
    contactNumber: '',
    spousePhone: '',
    contactEmail: ''
  });

  const [formTouched, setFormTouched] = useState({});
  const [kidsTouched, setKidsTouched] = useState([]);
  const [photoError, setPhotoError] = useState('');

  const markFormFieldTouched = (field) => {
    setFormTouched(prev => ({ ...prev, [field]: true }));
  };

  const markKidFieldTouched = (index, field) => {
    setKidsTouched(prev => {
      const newKidsTouched = [...prev];
      while (newKidsTouched.length <= index) {
        newKidsTouched.push({ name: false, dob: false, bloodGroup: false });
      }
      newKidsTouched[index] = { ...newKidsTouched[index], [field]: true };
      return newKidsTouched;
    });
  };

  const handleKidsCountChange = (count) => {
    const newCount = parseInt(count);
    const currentKids = [...formData.kids];
    
    if (newCount > currentKids.length) {
      for (let i = currentKids.length; i < newCount; i++) {
        currentKids.push({ name: '', dob: '', bloodGroup: '' });
      }
    } else {
      currentKids.length = newCount;
    }
    
    setFormData({
      ...formData,
      numberOfKids: count,
      kids: currentKids
    });
  };

  const updateKid = (index, field, value) => {
    const newKids = [...formData.kids];
    newKids[index] = { ...newKids[index], [field]: value };
    setFormData({ ...formData, kids: newKids });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 10) {
        setPhotoError('Image size must not exceed 10 MB');
        setFormData({...formData, photo: null});
      } else {
        setPhotoError('');
        setFormData({...formData, photo: file});
      }
    }
  };

  const handleFieldBlur = (fieldName, value) => {
    markFormFieldTouched(fieldName);
    
    let error = '';
    if (fieldName === 'whatsappNumber' || fieldName === 'contactNumber' || fieldName === 'spousePhone') {
      error = validatePhone(value);
    } else if (fieldName === 'contactEmail') {
      error = validateEmail(value);
    }
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData({...formData, [fieldName]: value});
    let error = '';
    if (fieldName === 'whatsappNumber' || fieldName === 'contactNumber' || fieldName === 'spousePhone') {
      error = validatePhone(value);
    } else if (fieldName === 'contactEmail') {
      error = validateEmail(value);
    }
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const isBasicDetailsComplete = () => {
    const basicFields = ['surname', 'name', 'gender', 'dob', 'qualification', 'occupation', 'fatherName', 'bloodGroup', 'willingToDonate', 'married'];
    return basicFields.every(field => formData[field]);
  };

  const isAllDetailsComplete = () => {
    if (!isBasicDetailsComplete()) return false;
    if (!formData.photo || photoError) return false;
    if (validateDobAge18(formData.dob)) return false;
    
    if (formData.married === 'Yes') {
      const spouseFields = ['dateOfMarriage', 'spouseName', 'spousePhone', 'spouseDob', 'spouseQualification', 'spouseBloodGroup', 'isSpouseMember'];
      const spouseFilled = spouseFields.every(field => formData[field]);
      if (!spouseFilled) return false;
      if (!/^[1-9][0-9]{9}$/.test(formData.spousePhone)) return false;
      if (validateNotFutureDate(formData.dateOfMarriage)) return false;
      if (validateNotFutureDate(formData.spouseDob)) return false;
      
      for (let i = 0; i < formData.kids.length; i++) {
        const kid = formData.kids[i];
        if (!kid.name || !kid.dob || !kid.bloodGroup) return false;
        if (validateNotFutureDate(kid.dob)) return false;
      }
    }
    
    return true;
  };

  const isFormValid = () => {
    if (!isAllDetailsComplete()) return false;
    if (!formData.contactEmail || !formData.addressResi || !formData.whatsappNumber || !formData.contactNumber) return false;
    if (fieldErrors.contactEmail || fieldErrors.whatsappNumber || fieldErrors.contactNumber) return false;
    if (formData.married === 'Yes' && fieldErrors.spousePhone) return false;
    if (validateEmail(formData.contactEmail)) return false;
    if (validatePhone(formData.whatsappNumber) || validatePhone(formData.contactNumber)) return false;
    if (!formData.isMaheshwariSabhaMember || !formData.isOtherClubMember) return false;
    if (!formData.declarationA || !formData.declarationB) return false;
    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      alert('Please fill all required fields correctly');
      return;
    }
    
    alert('Registration submitted successfully! We will contact you soon.');
    // Reset form
    setFormData({
      membershipStatus: 'New Registration', surname: '', name: '', photo: null, gender: '', dob: '',
      qualification: '', occupation: '', fatherName: '', bloodGroup: '', willingToDonate: '', married: '',
      dateOfMarriage: '', spouseName: '', spousePhone: '', spouseDob: '',
      spouseQualification: '', spouseBloodGroup: '', isSpouseMember: '', numberOfKids: '0', kids: [],
      contactEmail: '', whatsappNumber: '', contactNumber: '', addressResi: '', phoneLandline: '', addressOffice: '', phoneOffice: '',
      hobbies: '', isMaheshwariSabhaMember: '', isOtherClubMember: '', otherClubNames: '',
      declarationA: false, declarationB: false
    });
    setFieldErrors({ whatsappNumber: '', contactNumber: '', spousePhone: '', contactEmail: '' });
    setFormTouched({});
    setKidsTouched([]);
  };

  // Render helper for input with validation
  const renderInput = (label, field, type = 'text', placeholder = '', options = {}) => {
    const { required = true, hint = '', maxLength } = options;
    const hasError = formTouched[field] && !formData[field];
    
    return (
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          {label} {required && '*'} {hint && <span className="text-xs font-normal text-gray-500">{hint}</span>}
        </label>
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
          onBlur={() => markFormFieldTouched(field)}
          className={`w-full px-4 py-3 rounded-lg border ${hasError ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
          placeholder={placeholder}
          maxLength={maxLength}
        />
        {hasError && <p className="text-xs text-red-500 mt-1">This field is required</p>}
      </div>
    );
  };

  const renderSelect = (label, field, selectOptions, required = true) => {
    const hasError = formTouched[field] && !formData[field];
    
    return (
      <div>
        <label className="block text-gray-700 font-semibold mb-2">{label} {required && '*'}</label>
        <select
          value={formData[field]}
          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
          onBlur={() => markFormFieldTouched(field)}
          className={`w-full px-4 py-3 rounded-lg border ${hasError ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
        >
          {selectOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hasError && <p className="text-xs text-red-500 mt-1">This field is required</p>}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Basic Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Membership Status *</label>
          <select
            value={formData.membershipStatus}
            onChange={(e) => setFormData({...formData, membershipStatus: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
          >
            {MEMBERSHIP_STATUS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {renderInput('Surname', 'surname', 'text', 'Enter your surname')}
        {renderInput('Name', 'name', 'text', 'Enter your name')}
        
        {/* Photo Upload */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Current Photo * <span className="text-xs font-normal text-gray-500">(Max 10 MB)</span></label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-600 file:font-semibold hover:file:bg-orange-200 file:cursor-pointer"
          />
          {formData.photo && (
            <p className="text-sm text-green-600 mt-1">✓ {formData.photo.name} ({(formData.photo.size / (1024 * 1024)).toFixed(2)} MB)</p>
          )}
          {photoError && <p className="text-sm text-red-600 mt-1">✗ {photoError}</p>}
        </div>

        {renderSelect('Gender', 'gender', GENDER_OPTIONS)}
        
        {/* DOB with 18+ validation */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Date of Birth * <span className="text-xs font-normal text-gray-500">(Must be 18+)</span></label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({...formData, dob: e.target.value})}
            onBlur={() => markFormFieldTouched('dob')}
            max={getMaxDobFor18Plus()}
            className={`w-full px-4 py-3 rounded-lg border ${(formTouched.dob && !formData.dob) || validateDobAge18(formData.dob) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
          />
          {formTouched.dob && !formData.dob ? (
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          ) : validateDobAge18(formData.dob) ? (
            <p className="text-xs text-red-500 mt-1">{validateDobAge18(formData.dob)}</p>
          ) : null}
        </div>

        {renderInput('Qualification', 'qualification', 'text', 'Enter your qualification')}
        {renderInput('Occupation', 'occupation', 'text', 'Enter your occupation')}
        {renderInput('Father Name', 'fatherName', 'text', "Enter father's name")}
        {renderSelect('Blood Group', 'bloodGroup', BLOOD_GROUPS)}
        {renderSelect('Willing to Donate Blood?', 'willingToDonate', YES_NO_OPTIONS)}
        {renderSelect('Married', 'married', YES_NO_OPTIONS)}
      </div>

      {/* Marital Details - Conditional */}
      {formData.married === 'Yes' && (
        <div className="mt-6 p-6 bg-orange-50 rounded-xl">
          <h3 className="text-lg font-bold text-orange-600 mb-4">Marital Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Date of Marriage */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date of Marriage *</label>
              <input
                type="date"
                value={formData.dateOfMarriage}
                onChange={(e) => setFormData({...formData, dateOfMarriage: e.target.value})}
                onBlur={() => markFormFieldTouched('dateOfMarriage')}
                max={getTodayDate()}
                className={`w-full px-4 py-3 rounded-lg border ${(formTouched.dateOfMarriage && !formData.dateOfMarriage) || validateNotFutureDate(formData.dateOfMarriage) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
              />
              {formTouched.dateOfMarriage && !formData.dateOfMarriage ? (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              ) : validateNotFutureDate(formData.dateOfMarriage) ? (
                <p className="text-xs text-red-500 mt-1">{validateNotFutureDate(formData.dateOfMarriage)}</p>
              ) : null}
            </div>

            {renderInput('Spouse Name', 'spouseName', 'text', 'Enter spouse name')}

            {/* Spouse Phone with validation */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Spouse Phone Number *</label>
              <input
                type="tel"
                value={formData.spousePhone}
                onChange={(e) => handleFieldChange('spousePhone', e.target.value)}
                onBlur={(e) => handleFieldBlur('spousePhone', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${(formTouched.spousePhone && !formData.spousePhone) || fieldErrors.spousePhone ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                placeholder="10 digit number"
                maxLength="10"
              />
              {formTouched.spousePhone && !formData.spousePhone ? (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              ) : fieldErrors.spousePhone ? (
                <p className="text-xs text-red-500 mt-1">✗ {fieldErrors.spousePhone}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">10 digits, should not start with 0</p>
              )}
            </div>

            {/* Spouse DOB */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date of Birth (Spouse) *</label>
              <input
                type="date"
                value={formData.spouseDob}
                onChange={(e) => setFormData({...formData, spouseDob: e.target.value})}
                onBlur={() => markFormFieldTouched('spouseDob')}
                max={getTodayDate()}
                className={`w-full px-4 py-3 rounded-lg border ${(formTouched.spouseDob && !formData.spouseDob) || validateNotFutureDate(formData.spouseDob) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
              />
              {formTouched.spouseDob && !formData.spouseDob ? (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              ) : validateNotFutureDate(formData.spouseDob) ? (
                <p className="text-xs text-red-500 mt-1">{validateNotFutureDate(formData.spouseDob)}</p>
              ) : null}
            </div>

            {renderInput('Qualification (Spouse)', 'spouseQualification', 'text', 'Enter spouse qualification')}
            {renderSelect('Blood Group (Spouse)', 'spouseBloodGroup', BLOOD_GROUPS)}
            {renderSelect('Is Spouse Member of SMYM?', 'isSpouseMember', YES_NO_OPTIONS)}

            {/* Number of Kids */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Number of Kids *</label>
              <select
                value={formData.numberOfKids}
                onChange={(e) => handleKidsCountChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
              >
                {KIDS_COUNT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kids Details */}
          {formData.kids.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-bold text-orange-600 mb-4">Kids Details</h4>
              {formData.kids.map((kid, idx) => (
                <div key={idx} className="mb-4 p-4 bg-white rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-gray-700 mb-3">Kid {idx + 1}</h5>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-sm">Name *</label>
                      <input
                        type="text"
                        value={kid.name}
                        onChange={(e) => updateKid(idx, 'name', e.target.value)}
                        onBlur={() => markKidFieldTouched(idx, 'name')}
                        className={`w-full px-3 py-2 rounded-lg border ${kidsTouched[idx]?.name && !kid.name ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                        placeholder="Kid's name"
                      />
                      {kidsTouched[idx]?.name && !kid.name && (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-sm">Date of Birth *</label>
                      <input
                        type="date"
                        value={kid.dob}
                        onChange={(e) => updateKid(idx, 'dob', e.target.value)}
                        onBlur={() => markKidFieldTouched(idx, 'dob')}
                        max={getTodayDate()}
                        className={`w-full px-3 py-2 rounded-lg border ${(kidsTouched[idx]?.dob && !kid.dob) || validateNotFutureDate(kid.dob) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                      />
                      {kidsTouched[idx]?.dob && !kid.dob ? (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      ) : validateNotFutureDate(kid.dob) ? (
                        <p className="text-xs text-red-500 mt-1">{validateNotFutureDate(kid.dob)}</p>
                      ) : null}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-sm">Blood Group *</label>
                      <select
                        value={kid.bloodGroup}
                        onChange={(e) => updateKid(idx, 'bloodGroup', e.target.value)}
                        onBlur={() => markKidFieldTouched(idx, 'bloodGroup')}
                        className={`w-full px-3 py-2 rounded-lg border ${kidsTouched[idx]?.bloodGroup && !kid.bloodGroup ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                      >
                        {BLOOD_GROUPS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {kidsTouched[idx]?.bloodGroup && !kid.bloodGroup && (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Details Section */}
      {isBasicDetailsComplete() && (
        <>
          <div className="mt-6 p-6 bg-blue-50 rounded-xl">
            <h3 className="text-lg font-bold text-blue-600 mb-4">Contact Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                  onBlur={(e) => handleFieldBlur('contactEmail', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${(formTouched.contactEmail && !formData.contactEmail) || fieldErrors.contactEmail ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                  placeholder="your.email@example.com"
                />
                {formTouched.contactEmail && !formData.contactEmail ? (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                ) : fieldErrors.contactEmail ? (
                  <p className="text-xs text-red-500 mt-1">✗ {fieldErrors.contactEmail}</p>
                ) : null}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">WhatsApp Number *</label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleFieldChange('whatsappNumber', e.target.value)}
                  onBlur={(e) => handleFieldBlur('whatsappNumber', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${(formTouched.whatsappNumber && !formData.whatsappNumber) || fieldErrors.whatsappNumber ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                  placeholder="10 digit number"
                  maxLength="10"
                />
                {formTouched.whatsappNumber && !formData.whatsappNumber ? (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                ) : fieldErrors.whatsappNumber ? (
                  <p className="text-xs text-red-500 mt-1">✗ {fieldErrors.whatsappNumber}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">10 digits, should not start with 0</p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                  onBlur={(e) => handleFieldBlur('contactNumber', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${(formTouched.contactNumber && !formData.contactNumber) || fieldErrors.contactNumber ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                  placeholder="10 digit number"
                  maxLength="10"
                />
                {formTouched.contactNumber && !formData.contactNumber ? (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                ) : fieldErrors.contactNumber ? (
                  <p className="text-xs text-red-500 mt-1">✗ {fieldErrors.contactNumber}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">10 digits, should not start with 0</p>
                )}
              </div>

              {/* Landline */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone Number (L)</label>
                <input
                  type="tel"
                  value={formData.phoneLandline}
                  onChange={(e) => setFormData({...formData, phoneLandline: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Landline number (optional)"
                />
              </div>

              {/* Address Resi */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Address (Resi) *</label>
                <textarea
                  value={formData.addressResi}
                  onChange={(e) => setFormData({...formData, addressResi: e.target.value})}
                  onBlur={() => markFormFieldTouched('addressResi')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.addressResi && !formData.addressResi ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                  rows="2"
                  placeholder="Enter residential address"
                />
                {formTouched.addressResi && !formData.addressResi && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>

              {/* Office Phone */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone Number (Office)</label>
                <input
                  type="tel"
                  value={formData.phoneOffice}
                  onChange={(e) => setFormData({...formData, phoneOffice: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Office phone number (optional)"
                />
              </div>

              {/* Office Address */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Address (Office)</label>
                <input
                  type="text"
                  value={formData.addressOffice}
                  onChange={(e) => setFormData({...formData, addressOffice: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Office address (optional)"
                />
              </div>
            </div>
          </div>

          {/* Other Details Section */}
          <div className="mt-6 p-6 bg-purple-50 rounded-xl">
            <h3 className="text-lg font-bold text-purple-600 mb-4">Other Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Hobbies - Area of Interest</label>
                <input
                  type="text"
                  value={formData.hobbies}
                  onChange={(e) => setFormData({...formData, hobbies: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your hobbies and interests"
                />
              </div>
              
              {/* Maheshwari Sabha */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Are you member of Maheshwari Sabha? *</label>
                <select
                  value={formData.isMaheshwariSabhaMember}
                  onChange={(e) => setFormData({...formData, isMaheshwariSabhaMember: e.target.value})}
                  onBlur={() => markFormFieldTouched('isMaheshwariSabhaMember')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.isMaheshwariSabhaMember && !formData.isMaheshwariSabhaMember ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none`}
                >
                  {YES_NO_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {formTouched.isMaheshwariSabhaMember && !formData.isMaheshwariSabhaMember && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>

              {/* Other Club */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Are you member of any other Club/Sanstha? *</label>
                <select
                  value={formData.isOtherClubMember}
                  onChange={(e) => setFormData({...formData, isOtherClubMember: e.target.value})}
                  onBlur={() => markFormFieldTouched('isOtherClubMember')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.isOtherClubMember && !formData.isOtherClubMember ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none`}
                >
                  {YES_NO_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {formTouched.isOtherClubMember && !formData.isOtherClubMember && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>

              {formData.isOtherClubMember === 'Yes' && (
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">Name of Club/Sanstha (comma separated)</label>
                  <input
                    type="text"
                    value={formData.otherClubNames}
                    onChange={(e) => setFormData({...formData, otherClubNames: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter club/sanstha names separated by commas"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Declaration Section */}
          <div className="mt-6 p-6 bg-gray-100 rounded-xl">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Declaration</h3>
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.declarationA}
                  onChange={(e) => setFormData({...formData, declarationA: e.target.checked})}
                  className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700 text-sm">
                  (a) I hereby declare that the information given above are true and correct to the best of my knowledge and belief and nothing has been concealed.
                </span>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.declarationB}
                  onChange={(e) => setFormData({...formData, declarationB: e.target.checked})}
                  className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700 text-sm">
                  (b) I hereby undertake to abide by and adhere to the objects, rules, regulations and bylaws of Shree Maheshwari Yuva Mandal, Chennai.
                </span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isFormValid()}
        className={`w-full mt-6 py-4 rounded-lg font-bold text-lg transition flex items-center justify-center ${
          isFormValid()
            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Submit Registration
        <ChevronRight className="ml-2" />
      </button>
    </div>
  );
};

export default MemberRegistrationForm;
