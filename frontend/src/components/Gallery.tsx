'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Music, Award, Video, Filter, Search, Tag } from 'lucide-react';
import { galleryApi } from '@/services/api';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
}

const galleryCategories = [
  { id: 'all', label: 'All Photos' },
  { id: 'performances', label: 'Student Performances' },
  { id: 'instruments', label: 'Instruments' },
  { id: 'teachers', label: 'Our Teachers' },
  { id: 'events', label: 'Music Events' },
  { id: 'studios', label: 'Teaching Studios' },
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      
      // Fetch all gallery items
      const allResponse = await galleryApi.getAll();
      setGalleryItems(allResponse.data?.items || []);
      
      // Fetch featured items
      const featuredResponse = await galleryApi.getFeatured();
      setFeaturedItems(featuredResponse.data || []);
      
      // Fetch gallery statistics
      const statsResponse = await galleryApi.getStats();
      setStats(statsResponse.data);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch gallery data');
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategory = async (category: string) => {
    try {
      setLoading(true);
      if (category === 'all') {
        const response = await galleryApi.getAll();
        setGalleryItems(response.data?.items || []);
      } else {
        const response = await galleryApi.getByCategory(category);
        setGalleryItems(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchByCategory(selectedCategory);
      return;
    }

    try {
      setLoading(true);
      const response = await galleryApi.search(searchQuery);
      setGalleryItems(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(img => img.category === selectedCategory);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    } else {
      newIndex = (currentIndex + 1) % galleryItems.length;
    }
    setCurrentIndex(newIndex);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && galleryItems.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={fetchGalleryData}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 mb-6">
            <Music className="h-5 w-5 text-indigo-600 mr-2" />
            <span className="text-sm font-medium text-indigo-700">Visual Journey</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Music Gallery
          </h1>
          <p className="text-lg text-gray-600">
            Explore moments from our lessons, performances, studios, and music community.
            See the passion and dedication that makes our platform special.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search gallery by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 pl-12 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Featured Gallery */}
        {featuredItems.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="h-6 w-6 text-amber-500 mr-2" />
              Featured Moments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.slice(0, 3).map((image, index) => (
                <div
                  key={image.id}
                  className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer transform transition-all hover:scale-[1.02]"
                  onClick={() => openLightbox(galleryItems.findIndex(item => item.id === image.id))}
                >
                  <div className="aspect-[4/3] relative">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${image.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                          {image.category}
                        </div>
                        {image.featured && (
                          <div className="px-3 py-1 bg-amber-500/20 backdrop-blur-sm rounded-full text-sm">
                            Featured
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{image.title}</h3>
                      <p className="text-white/80 line-clamp-2">{image.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  fetchByCategory(category.id);
                }}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="h-4 w-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mb-16">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No gallery items found</div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  fetchByCategory('all');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                View All Gallery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:border-indigo-300 cursor-pointer"
                  onClick={() => openLightbox(galleryItems.findIndex(item => item.id === image.id))}
                >
                  {/* Image Container */}
                  <div className="aspect-square relative">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${image.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
                        {image.category}
                      </div>
                    </div>
                    {image.featured && (
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-amber-500/80 backdrop-blur-sm rounded-full text-white text-xs">
                          Featured
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {image.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {image.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(image.tags) && image.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs flex items-center"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {Array.isArray(image.tags) && image.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{image.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {formatDate(image.createdAt)}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-center p-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
                        <Video className="h-6 w-6" />
                      </div>
                      <div className="font-medium">Click to view</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Stats */}
        {stats && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.total || 0}</div>
                <div className="text-gray-600">Music Moments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.featured || 0}</div>
                <div className="text-gray-600">Featured Photos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.categories ? Object.keys(stats.categories).length : 0}
                </div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.tags?.length || 0}</div>
                <div className="text-gray-600">Unique Tags</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && galleryItems[currentIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-10"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={() => navigateImage('next')}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="max-w-4xl w-full">
            {/* Current Image Display */}
            <div className="relative aspect-video rounded-lg mb-4 overflow-hidden">
              <img 
                src={galleryItems[currentIndex].imageUrl} 
                alt={galleryItems[currentIndex].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {galleryItems[currentIndex].title}
                </h3>
                <p className="text-white/80 mb-3">
                  {galleryItems[currentIndex].description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(galleryItems[currentIndex].tags) && galleryItems[currentIndex].tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Info */}
            <div className="bg-white rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium text-gray-900 capitalize">{galleryItems[currentIndex].category}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Upload Date</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(galleryItems[currentIndex].createdAt)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Featured</div>
                  <div className="font-medium text-gray-900">
                    {galleryItems[currentIndex].featured ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Tags</div>
                  <div className="font-medium text-gray-900">{galleryItems[currentIndex].tags?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-6 left-0 right-0 px-6">
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {galleryItems.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentIndex === index 
                      ? 'border-white ring-2 ring-white' 
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${img.imageUrl})` }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}