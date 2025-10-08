import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ImageData {
  id: string;
  url: string;
  originalName: string;
  size: number;
  uploadDate: string;
  filename?: string;
  mimeType?: string;
  path?: string;
  description?: string;
  category?: string;
}

interface ImageState {
  images: ImageData[];
  filteredImages: ImageData[];
  searchTerm: string;
  loading: boolean;
  uploading: boolean;
  
  // Actions
  setImages: (images: ImageData[]) => void;
  addImage: (image: ImageData) => void;
  updateImage: (id: string, updates: Partial<ImageData>) => void;
  removeImage: (id: string) => void;
  setSearchTerm: (term: string) => void;
  setFilteredImages: (images: ImageData[]) => void;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  
  // Computed actions
  searchImages: (term: string) => void;
  clearSearch: () => void;
}

export const useImageStore = create<ImageState>()(
  devtools(
    persist(
      (set, get) => ({
      images: [],
      filteredImages: [],
      searchTerm: '',
      loading: false,
      uploading: false,

      setImages: (images) => {
        set({ images, filteredImages: images });
      },

      addImage: (image) => {
        const { images } = get();
        const newImages = [image, ...images];
        set({ images: newImages });
        
        // Update filtered images if there's an active search
        const { searchTerm } = get();
        if (searchTerm) {
          get().searchImages(searchTerm);
        } else {
          set({ filteredImages: newImages });
        }
      },

      updateImage: (id, updates) => {
        const { images } = get();
        const updatedImages = images.map(img => 
          img.id === id ? { ...img, ...updates } : img
        );
        set({ images: updatedImages });
        
        // Update filtered images
        const { filteredImages } = get();
        const updatedFilteredImages = filteredImages.map(img => 
          img.id === id ? { ...img, ...updates } : img
        );
        set({ filteredImages: updatedFilteredImages });
      },

      removeImage: (id) => {
        const { images } = get();
        const newImages = images.filter(img => img.id !== id);
        set({ images: newImages });
        
        // Update filtered images
        const { filteredImages } = get();
        const newFilteredImages = filteredImages.filter(img => img.id !== id);
        set({ filteredImages: newFilteredImages });
      },

      setSearchTerm: (term) => {
        set({ searchTerm: term });
      },

      setFilteredImages: (images) => {
        set({ filteredImages: images });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setUploading: (uploading) => {
        set({ uploading });
      },

      searchImages: (term) => {
        const { images } = get();
        
        if (!term.trim()) {
          set({ filteredImages: images, searchTerm: term });
          return;
        }

        const filtered = images.filter(image => {
          const filename = (image.filename || '').toLowerCase();
          const originalName = (image.originalName || '').toLowerCase();
          const searchTermLower = term.toLowerCase();
          
          return filename.includes(searchTermLower) || originalName.includes(searchTermLower);
        });
        
        set({ filteredImages: filtered, searchTerm: term });
      },

      clearSearch: () => {
        const { images } = get();
        set({ searchTerm: '', filteredImages: images });
      },
      }),
      {
        name: 'image-store',
        // Only persist images and searchTerm, not loading states
        partialize: (state) => ({
          images: state.images,
          searchTerm: state.searchTerm,
        }),
        // Use localStorage for better persistence across navigation
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          },
          setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            localStorage.removeItem(name);
          },
        },
      }
    ),
    {
      name: 'image-store-devtools',
    }
  )
);
