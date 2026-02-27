import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Grid, Maximize2, Calendar } from 'lucide-react';

const GalleryModal = ({ album, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('slideshow');
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const photos = album?.photos || [];
  const currentPhoto = photos[currentIndex];

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  }, [onClose, goToPrevious, goToNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setIsLoading(true);
    setImageError(false);
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [album]);

  const handleDownload = () => {
    if (currentPhoto) {
      window.open(currentPhoto, '_blank');
    }
  };

  if (!album || photos.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-white">
          <h3 className="font-bold text-lg">{album.title}</h3>
          <div className="flex items-center gap-3 text-sm opacity-70">
            <span>{currentIndex + 1} of {photos.length}</span>
            {album.date && (
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(album.date).toLocaleDateString('en-IN', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewMode(viewMode === 'slideshow' ? 'grid' : 'slideshow');
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
            title={viewMode === 'slideshow' ? 'Grid View' : 'Slideshow View'}
          >
            {viewMode === 'slideshow' ? <Grid className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
            title="Open in new tab"
          >
            <Download className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {viewMode === 'slideshow' ? (
        <div 
          className="relative w-full h-full flex items-center justify-center px-16"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={goToPrevious}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            
            {imageError ? (
              <div className="text-white text-center p-8">
                <p className="text-lg mb-2">Unable to load</p>
                <p className="text-sm opacity-70">The file may not exist</p>
              </div>
            ) : (
              <img
                src={currentPhoto}
                alt={`${album.title} - ${currentIndex + 1}`}
                className={`max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setImageError(true);
                }}
              />
            )}
          </div>

          <button
            onClick={goToNext}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </div>
      ) : (
        <div 
          className="w-full h-full overflow-y-auto pt-20 pb-8 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setViewMode('slideshow');
                }}
                className={`aspect-square relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                  index === currentIndex ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                <img
                  src={photo}
                  alt={`${album.title} - ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Thumbnails */}
      {viewMode === 'slideshow' && photos.length > 1 && (
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center gap-2 overflow-x-auto max-w-4xl mx-auto py-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                  index === currentIndex 
                    ? 'ring-2 ring-orange-500 scale-110' 
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryModal;
