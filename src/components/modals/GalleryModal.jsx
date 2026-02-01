import React from 'react';
import { X } from 'lucide-react';

const GalleryModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full z-10 hover:bg-white transition"
        >
          <X size={24} />
        </button>
        <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
          <span className="text-gray-400 text-lg">{image.title}</span>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg">{image.title}</h3>
          <p className="text-sm text-orange-600">{image.category}</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
