import React from 'react';
import { Image, Camera, Calendar } from 'lucide-react';
import { galleryAlbums } from '../../data/galleryData';

const GallerySection = ({ onImageSelect }) => {
  return (
    <section id="gallery" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Image className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Gallery</h2>
          <p className="text-gray-600">Capturing moments that matter</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryAlbums.map((album) => {
            const coverImage = album.photos && album.photos.length > 0 ? album.photos[0] : null;
            const hasPhotos = album.photos && album.photos.length > 0;
            
            return (
              <div 
                key={album.id}
                onClick={() => hasPhotos && onImageSelect(album)}
                className={`group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 ${
                  hasPhotos 
                    ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' 
                    : 'cursor-default opacity-75'
                }`}
              >
                {/* Cover Image or Placeholder */}
                <div className="aspect-video relative">
                  {coverImage ? (
                    <img 
                      src={coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-orange-300" />
                    </div>
                  )}
                  
                  {/* Photo Count Badge */}
                  {hasPhotos && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      {album.photos.length}
                    </div>
                  )}
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">{album.title}</h4>
                    <p className="text-sm opacity-80">{album.description}</p>
                    {hasPhotos && (
                      <p className="text-xs mt-1 opacity-60">Click to view {album.photos.length} photos</p>
                    )}
                  </div>
                </div>
                
                {/* Bottom Info Bar */}
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{album.title}</h4>
                      <span className="text-xs text-orange-600 font-medium">{album.category}</span>
                    </div>
                    {album.date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(album.date).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
