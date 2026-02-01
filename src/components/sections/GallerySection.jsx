import React from 'react';
import { Image } from 'lucide-react';
import { galleryImages } from '../../data/galleryData';

const GallerySection = ({ onImageSelect }) => {
  return (
    <section id="gallery" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Image className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Gallery</h2>
          <p className="text-gray-600">Capturing moments that matter</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <div 
              key={image.id}
              onClick={() => onImageSelect(image)}
              className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer"
            >
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">{image.title}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                <div className="text-white">
                  <h4 className="font-bold">{image.title}</h4>
                  <p className="text-sm opacity-80">{image.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
