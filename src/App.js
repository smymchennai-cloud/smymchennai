import React, { useState, useEffect } from 'react';
import { Calendar, Users, Image, UserPlus, Menu, X, ChevronRight, MapPin } from 'lucide-react';

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [selectedEventFlyer, setSelectedEventFlyer] = useState(null);
  const [openEventRegistration, setOpenEventRegistration] = useState(null);
  const [eventRegData, setEventRegData] = useState({
    fullName: '',
    numberOfParticipants: '1',
    participants: [{ name: '', age: '', isMember: '', mobile: '' }],
    paymentScreenshot: null
  });

  // Track touched fields for event registration
  const [eventRegTouched, setEventRegTouched] = useState({
    fullName: false,
    participants: [{ name: false, age: false, isMember: false, mobile: false }]
  });

  // Mark event registration field as touched
  const markEventFieldTouched = (field) => {
    setEventRegTouched(prev => ({ ...prev, [field]: true }));
  };

  // Mark participant field as touched
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

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedEventFlyer(null);
        setSelectedGalleryImage(null);
      }
    };
    
    if (selectedEventFlyer || selectedGalleryImage) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedEventFlyer, selectedGalleryImage]);

  // Handle participant count change
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

  // Update participant details
  const updateParticipant = (index, field, value) => {
    const newParticipants = [...eventRegData.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setEventRegData({ ...eventRegData, participants: newParticipants });
  };

  // Validate mobile number
  const isValidMobile = (mobile) => {
    return /^[1-9][0-9]{9}$/.test(mobile);
  };

  // Validate age (18-40)
  const isValidAge = (age) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 40;
  };

  // Handle event registration submit - redirects to Google Form
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
    
    // Prepare summary for the user
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
    
    // Open Google Form in new tab
    window.open('https://forms.gle/FE3hWS4FeEGGg8ox7', '_blank');
    
    // Reset form
    setOpenEventRegistration(null);
    setEventRegData({
      fullName: '',
      numberOfParticipants: '1',
      participants: [{ name: '', age: '', isMember: '', mobile: '' }],
      paymentScreenshot: null
    });
  };

  const officeBearers = [
    { name: 'Sudarshan Mantri', position: 'President' },
    { name: 'Kushal Maheswari', position: 'Secretary' },
    { name: 'Hemanth Bhattad', position: 'Vice President' },
    { name: 'Ketan Bisani', position: 'Vice President' },
    { name: 'Mohit Bajaj', position: 'Treasurer' },
    { name: 'Shubham Sarda', position: 'Joint Secretary' },
    { name: 'Nikhil Mohta', position: 'Joint Secretary' },
    { name: 'Madan Mohan Rathi', position: 'IPP' }
  ];

  const executiveMembers = [
    { name: 'Abhinandan Chandak', position: 'Executive Member' },
    { name: 'Ankit Rathi', position: 'Executive Member' },
    { name: 'Arnav Maheshwari', position: 'Executive Member' },
    { name: 'Arvind Kumar Jetha', position: 'Executive Member' },
    { name: 'Ashish Maheswari', position: 'Executive Member' },
    { name: 'Atul Maheswari', position: 'Executive Member' },
    { name: 'Chirag Jhawar', position: 'Executive Member' },
    { name: 'Girish Singh Mohta', position: 'Executive Member' },
    { name: 'Hemanth Bhattad', position: 'Executive Member' },
    { name: 'Jayesh Bisani', position: 'Executive Member' },
    { name: 'Jayesh Rathi', position: 'Executive Member' },
    { name: 'Kirti Suda', position: 'Executive Member' },
    { name: 'Laksh', position: 'Executive Member' },
    { name: 'Mahima Rathi', position: 'Executive Member' },
    { name: 'Saakshi Chandak', position: 'Executive Member' },
    { name: 'Tapas Bhattad', position: 'Executive Member' },
    { name: 'Vikramaditya Bisani', position: 'Executive Member' },
    { name: 'Yash Malpani', position: 'Executive Member' },
    { name: 'Yashika Malpani', position: 'Executive Member' }
  ];

  const advisors = [
    { name: 'Anil Kumar Kela', position: 'Advisor' },
    { name: 'Jai Prakash Malpani', position: 'Advisor' },
    { name: 'Praful Mohta', position: 'Advisor' },
    { name: 'Pramod Sarda', position: 'Advisor' },
    { name: 'Vinod Dwarkani', position: 'Advisor' }
  ];

  const upcomingEvents = [
    {
      id: 1,
      name: 'Neel aur Neer',
      date: '2026-02-15',
      time: '5:30 AM',
      venue: 'Kilpauk, Chennai',
      description: '',
      status: 'Coming Soon',
      flyer: '/neel-neer.png'
    },
    {
      id: 2,
      name: 'Turtle Trail',
      date: '2026-02-21',
      time: '11:00 PM - 5:00 AM',
      venue: 'Besant Nagar Beach',
      description: '',
      status: 'Registrations Closed',
      flyer: '/Turtle-Trail.png'
    },
    {
      id: 3,
      name: 'Quietly Powerful',
      date: '2026-03-08',
      time: 'TBA',
      venue: 'TBA',
      description: 'Special event celebrating International Women\'s Day',
      status: 'Coming Soon',
      flyer: null
    },
    {
      id: 4,
      name: 'AGM',
      date: '2026-04-12',
      time: 'TBA',
      venue: 'TBA',
      description: 'Annual General Meeting - Review, reflect, and plan ahead',
      status: 'Save the Date',
      flyer: null
    },
    {
      id: 5,
      name: 'Bulandi 2026',
      date: '2026-07-01',
      time: 'TBA',
      venue: 'TBA',
      description: 'Annual cultural extravaganza celebrating youth talent and community spirit',
      status: 'Coming Soon',
      flyer: null
    }
  ];

  const pastEvents = [
    { name: 'Diwali Celebration 2025', date: '2025-11-12', attendees: 250 },
    { name: 'Youth Summit 2025', date: '2025-08-20', attendees: 180 },
    { name: 'Blood Donation Camp', date: '2025-06-05', attendees: 120 },
    { name: 'Sports Meet 2025', date: '2025-04-15', attendees: 200 }
  ];

  const galleryImages = [
    { id: 1, title: 'Diwali 2025', category: 'Festival' },
    { id: 2, title: 'Youth Summit', category: 'Conference' },
    { id: 3, title: 'Sports Day', category: 'Sports' },
    { id: 4, title: 'Cultural Program', category: 'Cultural' },
    { id: 5, title: 'Community Service', category: 'Social' },
    { id: 6, title: 'Annual Meet', category: 'Meeting' }
  ];

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

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({
    whatsappNumber: '',
    contactNumber: '',
    spousePhone: '',
    contactEmail: ''
  });

  // Track touched fields for member registration
  const [formTouched, setFormTouched] = useState({});

  // Track touched fields for kids
  const [kidsTouched, setKidsTouched] = useState([]);

  // Mark member form field as touched
  const markFormFieldTouched = (field) => {
    setFormTouched(prev => ({ ...prev, [field]: true }));
  };

  // Mark kid field as touched
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

  // Handle number of kids change
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

  // Update kid details
  const updateKid = (index, field, value) => {
    const newKids = [...formData.kids];
    newKids[index] = { ...newKids[index], [field]: value };
    setFormData({ ...formData, kids: newKids });
  };

  // State for photo error
  const [photoError, setPhotoError] = useState('');

  // Handle photo upload with size validation (< 10 MB)
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

  // Phone number validation (10 digits, not starting with 0)
  const validatePhone = (value) => {
    if (!value) return '';
    if (!/^\d{10}$/.test(value)) return 'Must be exactly 10 digits';
    if (value.startsWith('0')) return 'Cannot start with 0';
    return '';
  };

  // Email validation
  const validateEmail = (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get max date for 18+ years (person must be at least 18)
  const getMaxDobFor18Plus = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  };

  // Validate DOB is at least 18 years ago
  const validateDobAge18 = (value) => {
    if (!value) return '';
    const dob = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    if (actualAge < 18) return 'Must be at least 18 years old';
    return '';
  };

  // Validate date is not in the future
  const validateNotFutureDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return 'Date cannot be in the future';
    return '';
  };

  // Handle field blur for validation
  const handleFieldBlur = (fieldName, value) => {
    // Mark field as touched
    markFormFieldTouched(fieldName);
    
    let error = '';
    if (fieldName === 'whatsappNumber' || fieldName === 'contactNumber' || fieldName === 'spousePhone') {
      error = validatePhone(value);
    } else if (fieldName === 'contactEmail') {
      error = validateEmail(value);
    }
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Handle field change with validation
  const handleFieldChange = (fieldName, value) => {
    setFormData({...formData, [fieldName]: value});
    // Validate on change
    let error = '';
    if (fieldName === 'whatsappNumber' || fieldName === 'contactNumber' || fieldName === 'spousePhone') {
      error = validatePhone(value);
    } else if (fieldName === 'contactEmail') {
      error = validateEmail(value);
    }
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Check if basic details section is complete (only core fields, not spouse/kids)
  const isBasicDetailsComplete = () => {
    const basicFields = ['surname', 'name', 'gender', 'dob', 'qualification', 'occupation', 'fatherName', 'bloodGroup', 'willingToDonate', 'married'];
    return basicFields.every(field => formData[field]);
  };

  // Check if all details including spouse/kids are complete
  const isAllDetailsComplete = () => {
    if (!isBasicDetailsComplete()) return false;
    
    // Check photo is uploaded and valid
    if (!formData.photo || photoError) return false;
    
    // Validate DOB is 18+
    if (validateDobAge18(formData.dob)) return false;
    
    // If married, check spouse and kids details
    if (formData.married === 'Yes') {
      const spouseFields = ['dateOfMarriage', 'spouseName', 'spousePhone', 'spouseDob', 'spouseQualification', 'spouseBloodGroup', 'isSpouseMember'];
      const spouseFilled = spouseFields.every(field => formData[field]);
      if (!spouseFilled) return false;
      
      // Validate spouse phone
      if (!/^[1-9][0-9]{9}$/.test(formData.spousePhone)) return false;
      
      // Validate date of marriage is not in future
      if (validateNotFutureDate(formData.dateOfMarriage)) return false;
      
      // Validate spouse DOB is not in future
      if (validateNotFutureDate(formData.spouseDob)) return false;
      
      // Check kids details
      for (let i = 0; i < formData.kids.length; i++) {
        const kid = formData.kids[i];
        if (!kid.name || !kid.dob || !kid.bloodGroup) return false;
        // Validate kid DOB is not in future
        if (validateNotFutureDate(kid.dob)) return false;
      }
    }
    
    return true;
  };

  // Check if form is ready for submission
  const isFormValid = () => {
    if (!isAllDetailsComplete()) return false;
    // Contact details validation
    if (!formData.contactEmail || !formData.addressResi || !formData.whatsappNumber || !formData.contactNumber) return false;
    // Check for field errors
    if (fieldErrors.contactEmail || fieldErrors.whatsappNumber || fieldErrors.contactNumber) return false;
    if (formData.married === 'Yes' && fieldErrors.spousePhone) return false;
    // Email regex check
    if (validateEmail(formData.contactEmail)) return false;
    // Phone validation
    if (validatePhone(formData.whatsappNumber) || validatePhone(formData.contactNumber)) return false;
    if (!formData.isMaheshwariSabhaMember || !formData.isOtherClubMember) return false;
    if (!formData.declarationA || !formData.declarationB) return false;
    return true;
  };

  const handleSubmit = () => {
    const requiredFields = ['surname', 'name', 'gender', 'dob', 'qualification', 'occupation', 'fatherName', 'bloodGroup', 'willingToDonate', 'married'];
    const allFilled = requiredFields.every(field => formData[field]);
    
    if (!allFilled) {
      alert('Please fill all required fields in Basic Details');
      return;
    }
    
    // Validate photo
    if (!formData.photo) {
      alert('Please upload your photo (max 10 MB)');
      return;
    }
    if (photoError) {
      alert(photoError);
      return;
    }
    
    // Validate Contact Details
    if (!formData.contactEmail) {
      alert('Please enter Email Address in Contact Details');
      return;
    }
    if (validateEmail(formData.contactEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!formData.whatsappNumber || validatePhone(formData.whatsappNumber)) {
      alert('WhatsApp Number must be 10 digits and not start with 0');
      return;
    }
    if (!formData.contactNumber || validatePhone(formData.contactNumber)) {
      alert('Contact Number must be 10 digits and not start with 0');
      return;
    }
    if (!formData.addressResi) {
      alert('Please enter Residential Address');
      return;
    }
    
    // Validate spouse details if married
    if (formData.married === 'Yes') {
      const spouseFields = ['dateOfMarriage', 'spouseName', 'spousePhone', 'spouseDob', 'spouseQualification', 'spouseBloodGroup', 'isSpouseMember'];
      const spouseFilled = spouseFields.every(field => formData[field]);
      
      if (!spouseFilled) {
        alert('Please fill all spouse/marital details');
        return;
      }
      
      // Validate spouse phone number
      if (!/^[1-9][0-9]{9}$/.test(formData.spousePhone)) {
        alert('Spouse phone number must be 10 digits and not start with 0');
        return;
      }
      
      // Validate kids details
      for (let i = 0; i < formData.kids.length; i++) {
        const kid = formData.kids[i];
        if (!kid.name || !kid.dob || !kid.bloodGroup) {
          alert(`Please fill all details for Kid ${i + 1}`);
          return;
        }
      }
    }
    
    // Validate Other Details
    if (!formData.isMaheshwariSabhaMember || !formData.isOtherClubMember) {
      alert('Please fill all required fields in Other Details');
      return;
    }
    
    // Validate Declarations
    if (!formData.declarationA || !formData.declarationB) {
      alert('Please accept both declarations to proceed');
      return;
    }
    
    alert('Registration submitted successfully! We will contact you soon.');
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
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-800">Empowering Youth,</h1>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                Building Community
              </span>
            </div>

            <nav className="hidden md:flex space-x-6">
              {['home', 'about', 'events', 'team', 'gallery', 'register'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`capitalize transition-all ${
                    activeSection === section
                      ? 'text-orange-600 font-semibold'
                      : 'text-gray-600 hover:text-orange-500'
                  }`}
                >
                  {section}
                </button>
              ))}
            </nav>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2">
              {['home', 'about', 'events', 'team', 'gallery', 'register'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="block w-full text-left px-4 py-2 capitalize hover:bg-orange-50 rounded"
                >
                  {section}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <img 
              src="/smym-logo-no-bg.png" 
              alt="SMYM Chennai Logo" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto mb-6"
            />
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
              Shree Maheshwari Yuva Mandal, Chennai
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              (under the patronage of Shree Maheshwari Sabha, Chennai)
            </p>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A vibrant community organization dedicated to youth development and social welfare in Chennai
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto border-t-4 border-orange-500">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Journey</h3>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Founded in 1985, Shree Maheshwari Yuva Mandal, Chennai has been a cornerstone of the Maheshwari community in Chennai for over three decades. What began as a small gathering of passionate young individuals has blossomed into a thriving organization with over 500 active members.
              </p>
              <p>
                Our mission has always been clear: to nurture young talent, preserve our rich cultural heritage, and contribute meaningfully to society. Through countless cultural programs, educational initiatives, and social welfare activities, we have touched thousands of lives and created lasting impact.
              </p>
              <p>
                Today, we stand proud as a beacon of community service, youth empowerment, and cultural celebration, continuing our founders' vision of creating a better tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">About Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Our Mission</h3>
              <p>To empower youth through cultural, educational, and social initiatives that strengthen community bonds.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p>A united community where every young individual can achieve their fullest potential and contribute to society.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold mb-3">Our Values</h3>
              <p>Integrity, service, cultural pride, youth empowerment, and community welfare guide everything we do.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Events</h2>

          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="mr-2 text-orange-600" />
              Upcoming Events
            </h3>
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className={`rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden mb-6 ${
                  event.status === 'Registrations Closed' 
                    ? 'bg-gradient-to-r from-gray-500 to-gray-700' 
                    : 'bg-gradient-to-r from-orange-500 to-red-600'
                }`}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${
                    event.status === 'Registrations Closed' 
                      ? 'bg-red-500/80' 
                      : 'bg-white/20'
                  }`}>
                    {event.status}
                  </div>
                  <h4 className="text-4xl font-bold mb-4">{event.name}</h4>
                  <p className="text-xl mb-6">{event.description}</p>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center">
                      <Calendar className="mr-2" />
                      <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">🕐</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {event.status !== 'Registrations Closed' && event.name === 'Neel aur Neer' && (
                      <button 
                        onClick={() => setOpenEventRegistration(openEventRegistration === event.id ? null : event.id)}
                        className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition flex items-center"
                      >
                        {openEventRegistration === event.id ? 'Close Registration' : 'Register Now'}
                        <ChevronRight className={`ml-2 transition-transform ${openEventRegistration === event.id ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                    {event.status !== 'Registrations Closed' && event.name !== 'Neel aur Neer' && (
                  <button className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition flex items-center">
                    Register Now
                    <ChevronRight className="ml-2" />
                  </button>
                    )}
                    {event.flyer && (
                      <button 
                        onClick={() => setSelectedEventFlyer(event)}
                        className="bg-white/20 text-white px-8 py-3 rounded-full font-bold hover:bg-white/30 transition flex items-center border-2 border-white/50"
                      >
                        View Details
                        <Image className="ml-2 w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Neel aur Neer Registration Accordion */}
                  {event.name === 'Neel aur Neer' && openEventRegistration === event.id && (
                    <div className="mt-6 bg-white rounded-xl p-6 text-gray-800 animate-in slide-in-from-top">
                      <h5 className="text-xl font-bold mb-4 text-orange-600">Event Registration</h5>
                      
                      {/* Full Name */}
                      <div className="mb-4">
                        <label className="block font-semibold mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={eventRegData.fullName}
                          onChange={(e) => setEventRegData({...eventRegData, fullName: e.target.value})}
                          onBlur={() => markEventFieldTouched('fullName')}
                          className={`w-full px-4 py-3 rounded-lg border ${eventRegTouched.fullName && !eventRegData.fullName ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                          placeholder="Enter your full name"
                        />
                        {eventRegTouched.fullName && !eventRegData.fullName && (
                          <p className="text-xs text-red-500 mt-1">This field is required</p>
                        )}
                      </div>

                      {/* Number of Participants */}
                      <div className="mb-4">
                        <label className="block font-semibold mb-2">Number of Participants *</label>
                        <select
                          value={eventRegData.numberOfParticipants}
                          onChange={(e) => handleParticipantCountChange(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>

                      {/* Participant Details */}
                      {eventRegData.participants.map((participant, idx) => (
                        <div key={idx} className="mb-6 p-4 bg-orange-50 rounded-lg">
                          <h6 className="font-bold text-orange-600 mb-3">Participant {idx + 1} Details</h6>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold mb-1 text-sm">Name *</label>
                              <input
                                type="text"
                                value={participant.name}
                                onChange={(e) => updateParticipant(idx, 'name', e.target.value)}
                                onBlur={() => markParticipantFieldTouched(idx, 'name')}
                                className={`w-full px-3 py-2 rounded-lg border ${eventRegTouched.participants[idx]?.name && !participant.name ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                                placeholder="Participant name"
                              />
                              {eventRegTouched.participants[idx]?.name && !participant.name && (
                                <p className="text-xs text-red-500 mt-1">This field is required</p>
                              )}
                            </div>
                            <div>
                              <label className="block font-semibold mb-1 text-sm">Age * <span className="font-normal text-gray-500">(18-40)</span></label>
                              <input
                                type="number"
                                value={participant.age}
                                onChange={(e) => updateParticipant(idx, 'age', e.target.value)}
                                onBlur={() => markParticipantFieldTouched(idx, 'age')}
                                className={`w-full px-3 py-2 rounded-lg border ${(eventRegTouched.participants[idx]?.age && !participant.age) || (participant.age && !isValidAge(participant.age)) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                                placeholder="18-40"
                                min="18"
                                max="40"
                              />
                              {eventRegTouched.participants[idx]?.age && !participant.age ? (
                                <p className="text-xs text-red-500 mt-1">This field is required</p>
                              ) : participant.age && !isValidAge(participant.age) ? (
                                <p className="text-xs text-red-500 mt-1">Age must be between 18-40</p>
                              ) : null}
                            </div>
                            <div>
                              <label className="block font-semibold mb-1 text-sm">SMYM Member *</label>
                              <select
                                value={participant.isMember}
                                onChange={(e) => updateParticipant(idx, 'isMember', e.target.value)}
                                onBlur={() => markParticipantFieldTouched(idx, 'isMember')}
                                className={`w-full px-3 py-2 rounded-lg border ${eventRegTouched.participants[idx]?.isMember && !participant.isMember ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                              {eventRegTouched.participants[idx]?.isMember && !participant.isMember && (
                                <p className="text-xs text-red-500 mt-1">This field is required</p>
                              )}
                            </div>
                            <div>
                              <label className="block font-semibold mb-1 text-sm">Mobile Number *</label>
                              <input
                                type="tel"
                                value={participant.mobile}
                                onChange={(e) => updateParticipant(idx, 'mobile', e.target.value)}
                                onBlur={() => markParticipantFieldTouched(idx, 'mobile')}
                                className={`w-full px-3 py-2 rounded-lg border ${(eventRegTouched.participants[idx]?.mobile && !participant.mobile) || (participant.mobile && !isValidMobile(participant.mobile)) ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
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
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h6 className="font-bold text-blue-600 mb-3">💳 Payment Details</h6>
                        <p className="text-sm mb-2">Please transfer the registration charges via GPay or NEFT:</p>
                        <div className="bg-white p-4 rounded-lg text-sm space-y-1">
                          <p><strong>Name:</strong> SHREE MAHESWARI YUVA MANDAL</p>
                          <p><strong>Bank:</strong> Karur Vysya Bank - Godown St Branch, Chennai - 600 001</p>
                          <p><strong>Account Number:</strong> 1755115000000465</p>
                          <p><strong>IFSC Code:</strong> KVBL0001755</p>
                        </div>
                      </div>

                      {/* Payment Screenshot */}
                      <div className="mb-6">
                        <label className="block font-semibold mb-2">Payment Screenshot *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEventRegData({...eventRegData, paymentScreenshot: e.target.files[0]})}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-600 file:font-semibold hover:file:bg-orange-200 file:cursor-pointer"
                        />
                        {eventRegData.paymentScreenshot && (
                          <p className="text-sm text-green-600 mt-1">✓ {eventRegData.paymentScreenshot.name}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleEventRegistrationSubmit}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-bold hover:from-orange-700 hover:to-red-700 transition"
                      >
                        Submit Registration
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="mr-2 text-orange-600" />
              Past Events
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pastEvents.map((event, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                  <h4 className="font-bold text-gray-800 mb-2">{event.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{new Date(event.date).toLocaleDateString('en-IN')}</p>
                  <p className="text-sm text-orange-600 font-semibold">{event.attendees} Attendees</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Our Leadership</h2>
          <p className="text-center text-gray-600 mb-12">Meet the dedicated individuals guiding our organization</p>

          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <Users className="mr-2 text-orange-600" />
              Office Bearers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {officeBearers.map((bearer, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                    {bearer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 className="text-sm md:text-lg font-bold text-center text-gray-800">{bearer.name}</h4>
                  <p className="text-orange-600 text-center font-semibold text-xs md:text-base">{bearer.position}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <Users className="mr-2 text-orange-600" />
              Executive Committee Members
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {executiveMembers.map((member, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 className="text-sm md:text-lg font-bold text-center text-gray-800">{member.name}</h4>
                  <p className="text-orange-600 text-center font-semibold text-xs md:text-base">{member.position}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <Users className="mr-2 text-orange-600" />
              Advisors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {advisors.map((advisor, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                    {advisor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 className="text-sm md:text-lg font-bold text-center text-gray-800">{advisor.name}</h4>
                  <p className="text-orange-600 text-center font-semibold text-xs md:text-base">{advisor.position}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Gallery</h2>
          <p className="text-center text-gray-600 mb-12">Capturing moments that matter</p>

          <div className="grid md:grid-cols-3 gap-6">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="relative aspect-video bg-gradient-to-br from-orange-200 to-red-200 rounded-xl overflow-hidden cursor-pointer group hover:shadow-2xl transition-all"
                onClick={() => setSelectedGalleryImage(img)}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                  <Image className="w-16 h-16 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white font-bold">{img.title}</p>
                  <p className="text-white/80 text-sm">{img.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-20 bg-gradient-to-br from-orange-50 to-red-50 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <UserPlus className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Become a Member</h2>
            <p className="text-gray-600">Join our growing community and be part of something special</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Membership Status *</label>
                <select
                  value={formData.membershipStatus}
                  onChange={(e) => setFormData({...formData, membershipStatus: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                >
                  <option value="New Registration">New Registration</option>
                  <option value="Old Member Data Updation">Old Member Data Updation</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Surname *</label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                  onBlur={() => markFormFieldTouched('surname')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.surname && !formData.surname ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                  placeholder="Enter your surname"
                />
                {formTouched.surname && !formData.surname && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  onBlur={() => markFormFieldTouched('name')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.name && !formData.name ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                  placeholder="Enter your name"
                />
                {formTouched.name && !formData.name && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Current Photo * <span className="text-xs font-normal text-gray-500">(Max 10 MB)</span></label>
                <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-600 file:font-semibold hover:file:bg-orange-200 file:cursor-pointer"
                  />
                  {formData.photo && (
                    <p className="text-sm text-green-600 mt-1">✓ {formData.photo.name} ({(formData.photo.size / (1024 * 1024)).toFixed(2)} MB)</p>
                  )}
                  {photoError && (
                    <p className="text-sm text-red-600 mt-1">✗ {photoError}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  onBlur={() => markFormFieldTouched('gender')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.gender && !formData.gender ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {formTouched.gender && !formData.gender && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
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
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Qualification *</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  onBlur={() => markFormFieldTouched('qualification')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.qualification && !formData.qualification ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                  placeholder="Enter your qualification"
                />
                {formTouched.qualification && !formData.qualification && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Occupation *</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  onBlur={() => markFormFieldTouched('occupation')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.occupation && !formData.occupation ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                  placeholder="Enter your occupation"
                />
                {formTouched.occupation && !formData.occupation && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Father Name *</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                  onBlur={() => markFormFieldTouched('fatherName')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.fatherName && !formData.fatherName ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                  placeholder="Enter father's name"
                />
                {formTouched.fatherName && !formData.fatherName && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Blood Group *</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  onBlur={() => markFormFieldTouched('bloodGroup')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.bloodGroup && !formData.bloodGroup ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="A1+">A1+</option>
                </select>
                {formTouched.bloodGroup && !formData.bloodGroup && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Willing to Donate Blood? *</label>
                <select
                  value={formData.willingToDonate}
                  onChange={(e) => setFormData({...formData, willingToDonate: e.target.value})}
                  onBlur={() => markFormFieldTouched('willingToDonate')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.willingToDonate && !formData.willingToDonate ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {formTouched.willingToDonate && !formData.willingToDonate && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Married *</label>
                <select
                  value={formData.married}
                  onChange={(e) => setFormData({...formData, married: e.target.value})}
                  onBlur={() => markFormFieldTouched('married')}
                  className={`w-full px-4 py-3 rounded-lg border ${formTouched.married && !formData.married ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {formTouched.married && !formData.married && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
            </div>

            {/* Marital Details - Conditional */}
            {formData.married === 'Yes' && (
              <div className="mt-6 p-6 bg-orange-50 rounded-xl">
                <h3 className="text-lg font-bold text-orange-600 mb-4">Marital Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
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
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Spouse Name *</label>
                    <input
                      type="text"
                      value={formData.spouseName}
                      onChange={(e) => setFormData({...formData, spouseName: e.target.value})}
                      onBlur={() => markFormFieldTouched('spouseName')}
                      className={`w-full px-4 py-3 rounded-lg border ${formTouched.spouseName && !formData.spouseName ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                      placeholder="Enter spouse name"
                    />
                    {formTouched.spouseName && !formData.spouseName && (
                      <p className="text-xs text-red-500 mt-1">This field is required</p>
                    )}
                  </div>
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
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Qualification (Spouse) *</label>
                    <input
                      type="text"
                      value={formData.spouseQualification}
                      onChange={(e) => setFormData({...formData, spouseQualification: e.target.value})}
                      onBlur={() => markFormFieldTouched('spouseQualification')}
                      className={`w-full px-4 py-3 rounded-lg border ${formTouched.spouseQualification && !formData.spouseQualification ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                      placeholder="Enter spouse qualification"
                    />
                    {formTouched.spouseQualification && !formData.spouseQualification && (
                      <p className="text-xs text-red-500 mt-1">This field is required</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Blood Group (Spouse) *</label>
                    <select
                      value={formData.spouseBloodGroup}
                      onChange={(e) => setFormData({...formData, spouseBloodGroup: e.target.value})}
                      onBlur={() => markFormFieldTouched('spouseBloodGroup')}
                      className={`w-full px-4 py-3 rounded-lg border ${formTouched.spouseBloodGroup && !formData.spouseBloodGroup ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="A1+">A1+</option>
                    </select>
                    {formTouched.spouseBloodGroup && !formData.spouseBloodGroup && (
                      <p className="text-xs text-red-500 mt-1">This field is required</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Is Spouse Member of SMYM? *</label>
                    <select
                      value={formData.isSpouseMember}
                      onChange={(e) => setFormData({...formData, isSpouseMember: e.target.value})}
                      onBlur={() => markFormFieldTouched('isSpouseMember')}
                      className={`w-full px-4 py-3 rounded-lg border ${formTouched.isSpouseMember && !formData.isSpouseMember ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:outline-none`}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {formTouched.isSpouseMember && !formData.isSpouseMember && (
                      <p className="text-xs text-red-500 mt-1">This field is required</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Number of Kids *</label>
                    <select
                      value={formData.numberOfKids}
                      onChange={(e) => handleKidsCountChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
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
                              <option value="">Select</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="A1+">A1+</option>
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

            {/* Contact Details Section - Only shows when basic details are complete */}
            {isBasicDetailsComplete() && (
              <>
                <div className="mt-6 p-6 bg-blue-50 rounded-xl">
                  <h3 className="text-lg font-bold text-blue-600 mb-4">Contact Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
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
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2">Address (Resi) *</label>
                      <textarea
                        value={formData.addressResi}
                        onChange={(e) => setFormData({...formData, addressResi: e.target.value})}
                        onBlur={() => markFormFieldTouched('addressResi')}
                        className={`w-full px-4 py-3 rounded-lg border ${formTouched.addressResi && !formData.addressResi ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                        rows="2"
                        placeholder="Enter residential address"
              ></textarea>
                      {formTouched.addressResi && !formData.addressResi && (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      )}
            </div>
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
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Are you member of Maheshwari Sabha? *</label>
                      <select
                        value={formData.isMaheshwariSabhaMember}
                        onChange={(e) => setFormData({...formData, isMaheshwariSabhaMember: e.target.value})}
                        onBlur={() => markFormFieldTouched('isMaheshwariSabhaMember')}
                        className={`w-full px-4 py-3 rounded-lg border ${formTouched.isMaheshwariSabhaMember && !formData.isMaheshwariSabhaMember ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none`}
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {formTouched.isMaheshwariSabhaMember && !formData.isMaheshwariSabhaMember && (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2">Are you member of any other Club/Sanstha? *</label>
                      <select
                        value={formData.isOtherClubMember}
                        onChange={(e) => setFormData({...formData, isOtherClubMember: e.target.value})}
                        onBlur={() => markFormFieldTouched('isOtherClubMember')}
                        className={`w-full px-4 py-3 rounded-lg border ${formTouched.isOtherClubMember && !formData.isOtherClubMember ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none`}
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/smym-logo-no-bg.png" 
              alt="SMYM Chennai Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="text-left">
              <h3 className="font-bold">Shree Maheshwari Yuva Mandal, Chennai</h3>
              <p className="text-xs text-gray-400">(under the patronage of Shree Maheshwari Sabha, Chennai)</p>
            </div>
          </div>
          <p className="text-gray-400 mb-4">Empowering Youth, Building Community</p>
          <div className="flex justify-center space-x-6 mb-6">
            <a href="https://www.facebook.com/share/1AV57yUmYX/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition">Facebook</a>
            <a href="https://www.instagram.com/smymchennai?igsh=NGZxcjRkZ2NhNDA2" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition">Instagram</a>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Shree Maheshwari Yuva Mandal, Chennai. All rights reserved.</p>
        </div>
      </footer>

      {/* Gallery Modal */}
      {selectedGalleryImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedGalleryImage(null)}
        >
          <div className="max-w-4xl w-full bg-white rounded-xl p-4">
            <div className="aspect-video bg-gradient-to-br from-orange-200 to-red-200 rounded-lg mb-4 flex items-center justify-center">
              <Image className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{selectedGalleryImage.title}</h3>
            <p className="text-gray-600">{selectedGalleryImage.category}</p>
          </div>
        </div>
      )}

      {/* Event Flyer Modal */}
      {selectedEventFlyer && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedEventFlyer(null)}
        >
          <div 
            className="relative max-w-md w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedEventFlyer(null)}
              className="absolute -top-10 right-0 text-white hover:text-orange-400 transition flex items-center gap-2 z-10"
            >
              <span className="text-sm">Close</span>
              <X className="w-6 h-6" />
            </button>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="overflow-auto flex-shrink">
                <img 
                  src={selectedEventFlyer.flyer} 
                  alt={`${selectedEventFlyer.name} Flyer`}
                  className="w-full h-auto object-contain max-h-[60vh]"
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white flex-shrink-0">
                <h3 className="text-xl font-bold mb-1">{selectedEventFlyer.name}</h3>
                <p className="text-white/90 text-sm">{selectedEventFlyer.description}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(selectedEventFlyer.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center">
                    🕐 {selectedEventFlyer.time}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {selectedEventFlyer.venue}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;