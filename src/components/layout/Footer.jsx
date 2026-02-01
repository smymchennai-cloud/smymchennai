import React from 'react';

const Footer = () => {
  return (
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
        <div className="flex justify-center space-x-6 mb-6">
          <a 
            href="https://www.facebook.com/share/1AV57yUmYX/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-orange-500 transition"
          >
            Facebook
          </a>
          <a 
            href="https://www.instagram.com/smymchennai?igsh=NGZxcjRkZ2NhNDA2" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-orange-500 transition"
          >
            Instagram
          </a>
        </div>
        <p className="text-gray-500 text-sm">© 2026 Shree Maheshwari Yuva Mandal, Chennai. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
