import React, { useState } from 'react';
import { Calendar, Users, Image, UserPlus, Menu, X, ChevronRight, MapPin } from 'lucide-react';

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);

  const officeBearers = [
    { name: 'Sudarshan Mantri', position: 'President' },
    { name: 'Hemanth Bhattad', position: 'Vice President' },
    { name: 'Ketan Bisani', position: 'Vice President' },
    { name: 'Kushal Maheswari', position: 'Secretary' },
    { name: 'Mohit Bajaj', position: 'Treasurer' },
    { name: 'Shubham Sarda', position: 'Joint Secretary' },
    { name: 'Nikhil Mohta', position: 'Joint Secretary' }
  ];

  const executiveMembers = [
    { name: 'Madan Mohan Rathi', position: 'IPP' },
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
      name: 'Bulandi 2026',
      date: '2026-03-15',
      time: '6:00 PM',
      venue: 'Chennai Convention Centre',
      description: 'Annual cultural extravaganza celebrating youth talent and community spirit',
      status: 'Registrations Open'
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
    email: '',
    membershipStatus: 'New Registration',
    surname: '',
    name: '',
    gender: '',
    dob: '',
    qualification: '',
    occupation: '',
    fatherName: '',
    bloodGroup: '',
    willingToDonate: '',
    whatsappNumber: '',
    contactNumber: '',
    married: ''
  });

  const handleSubmit = () => {
    const requiredFields = ['email', 'surname', 'name', 'gender', 'dob', 'qualification', 'occupation', 'fatherName', 'bloodGroup', 'willingToDonate', 'whatsappNumber', 'contactNumber', 'married'];
    const allFilled = requiredFields.every(field => formData[field]);
    
    if (allFilled) {
      alert('Registration submitted successfully! We will contact you soon.');
      setFormData({
        email: '', membershipStatus: 'New Registration', surname: '', name: '', gender: '', dob: '',
        qualification: '', occupation: '', fatherName: '', bloodGroup: '', willingToDonate: '',
        whatsappNumber: '', contactNumber: '', married: ''
      });
    } else {
      alert('Please fill all required fields');
    }
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
              {['home', 'about', 'team', 'events', 'gallery', 'register'].map((section) => (
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
              {['home', 'about', 'team', 'events', 'gallery', 'register'].map((section) => (
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
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Shree Maheshwari Yuva Mandal
            </h2>
            <p className="text-2xl font-semibold text-gray-800 mb-6">
              Chennai
            </p>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A vibrant community organization dedicated to youth development and social welfare in Chennai
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto border-t-4 border-orange-500">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Journey</h3>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Founded in 1985, Shree Maheshwari Yuva Mandal has been a cornerstone of the Maheshwari community in Chennai for over three decades. What began as a small gathering of passionate young individuals has blossomed into a thriving organization with over 500 active members.
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {officeBearers.map((bearer, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {bearer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 className="text-lg font-bold text-center text-gray-800">{bearer.name}</h4>
                  <p className="text-orange-600 text-center font-semibold">{bearer.position}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <Users className="mr-2 text-orange-600" />
              Executive Committee Members
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {executiveMembers.map((member, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 className="text-lg font-bold text-center text-gray-800">{member.name}</h4>
                  <p className="text-orange-600 text-center font-semibold">{member.position}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <Users className="mr-2 text-orange-600" />
              Advisors
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {advisors.map((advisor, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {advisor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 className="text-lg font-bold text-center text-gray-800">{advisor.name}</h4>
                  <p className="text-orange-600 text-center font-semibold">{advisor.position}</p>
                </div>
              ))}
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
              <div key={event.id} className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold mb-4">
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
                  <button className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition flex items-center">
                    Register Now
                    <ChevronRight className="ml-2" />
                  </button>
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
                <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                  placeholder="Enter your surname"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Qualification *</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                  placeholder="Enter your qualification"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Occupation *</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                  placeholder="Enter your occupation"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Father Name *</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                  placeholder="Enter father's name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Blood Group *</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
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
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Willing to Donate Blood? *</label>
                <select
                  value={formData.willingToDonate}
                  onChange={(e) => setFormData({...formData, willingToDonate: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">WhatsApp Number *</label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Married *</label>
                <select
                  value={formData.married}
                  onChange={(e) => setFormData({...formData, married: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 transition flex items-center justify-center"
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
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">SM</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold">Shree Maheshwari Yuva Mandal</h3>
              <p className="text-sm text-gray-400">Chennai</p>
            </div>
          </div>
          <p className="text-gray-400 mb-4">Empowering Youth, Building Community</p>
          <div className="flex justify-center space-x-6 mb-6">
            <button className="hover:text-orange-500 transition">Facebook</button>
            <button className="hover:text-orange-500 transition">Instagram</button>
            <button className="hover:text-orange-500 transition">Twitter</button>
            <button className="hover:text-orange-500 transition">LinkedIn</button>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Shree Maheshwari Yuva Mandal. All rights reserved.</p>
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
    </div>
  );
};

export default App;