import React from 'react';
import { Mail, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-12 px-4">
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
        
        {/* Contact & Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-6">
          <a 
            href="mailto:smymchennai@gmail.com" 
            className="flex items-center gap-2 hover:text-orange-500 transition"
          >
            <Mail className="w-5 h-5" />
            <span>smymchennai@gmail.com</span>
          </a>
          <a 
            href="https://www.facebook.com/share/1AV57yUmYX/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 hover:text-blue-500 transition"
          >
            <Facebook className="w-5 h-5" />
            <span>Facebook</span>
          </a>
          <a 
            href="https://www.instagram.com/smymchennai?igsh=NGZxcjRkZ2NhNDA2" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 hover:text-pink-500 transition"
          >
            <Instagram className="w-5 h-5" />
            <span>Instagram</span>
          </a>
        </div>
        
        <p className="text-gray-500 text-sm">© 2026 Shree Maheshwari Yuva Mandal, Chennai. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
