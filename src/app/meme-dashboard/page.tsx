"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useApi } from '../../hooks/useApi';
import { MoonLoader } from 'react-spinners';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ImageData {
  id: string;
  url: string;
  originalName: string;
  size: number;
  uploadDate: string;
}

export default function ImageDashboard() {
  const { data: session, status } = useSession();
  const { uploadImage, deleteImage, getImages, isAuthenticated } = useApi();
  const [images, setImages] = useState<ImageData[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadImages();
    }
  }, [isAuthenticated]);

  const loadImages = async () => {
    setLoadingImages(true);
    try {
      const imageList = await getImages();
      setImages(imageList);
      setFilteredImages(imageList);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Search functionality with useCallback for performance
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredImages(images);
      return;
    }

    const filtered = images.filter(image =>
      image.originalName.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredImages(filtered);
  }, [images]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          await uploadImage(file);
        }
      }
      await loadImages();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImage(imageId);
        await loadImages();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Delete failed. Please try again.');
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  if (status === 'loading') {
    return <div className='h-screen flex items-center justify-center'><MoonLoader size={20} color='#FFFFFF' /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-black'>
        <div className='text-center max-w-md mx-auto p-8'>
          <div 
            className='w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center'
            style={{
              background: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)'
            }}
          >
            <Search className='w-8 h-8 text-white' />
          </div>
          <h2 className='text-2xl font-bold text-white mb-4'>Access Required</h2>
          <p className='text-white/60 mb-8'>
            Please sign in to access the meme dashboard and manage your images.
          </p>
          <Link
            href='/auth/signin'
            className='inline-flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105'
            style={{
              background: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)'
            }}
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Meme Management Dashboard</h1>
        
        {/* Search Bar */}
        <div className="flex items-center relative">
          <Search color="#FFFFFF50" size={16} className="absolute left-2" />
          <input
            type="text"
            placeholder="Search images..."
            className="w-full md:w-64 pl-8 pr-4 py-2 rounded-lg border border-[#FFFFFF]/20 bg-transparent text-white placeholder:text-[#FFFFFF]/50"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:block">Welcome, {session?.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="text-white px-4 py-2 rounded transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <p className="text-lg mb-4">Drag & drop images here or click to select</p>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <label
          htmlFor="fileInput"
          className="text-white px-6 py-3 rounded cursor-pointer transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(100.86deg, rgba(255, 0, 117, 0.8) 4.13%, rgba(255, 74, 21, 0.8) 55.91%, rgba(255, 203, 69, 0.8) 100%)'
          }}
        >
          {uploading ? 'Uploading...' : 'Select Images'}
        </label>
      </div>

      {/* Loading State */}
      {loadingImages && (
        <div className="flex flex-col items-center justify-center py-20">
            <MoonLoader size={24} color="#FFFFFF" />
          <h3 className="text-xl font-semibold text-white mb-2">Loading Images</h3>
          <p className="text-white/60">Please wait while we fetch your images...</p>
        </div>
      )}

      {/* Images List */}
      {!loadingImages && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredImages.map((image) => (
            <div key={image.id} className="border border-[#262626] rounded-lg p-3 bg-[#1a1a1a]">
              <div className="aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden relative">
                <Image
                  src={image.url}
                  alt={image.originalName}
                  fill
                  className="object-cover"
                  onError={() => {
                    // Handle error by showing fallback
                  }}
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold truncate text-white text-sm">{image.originalName}</h3>
                <p className="text-xs text-gray-400">
                  {(image.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(image.uploadDate).toLocaleDateString()}
                </p>
                <div className="flex gap-1">
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs flex-1 text-center transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-xs flex-1 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Images Message */}
      {!loadingImages && filteredImages.length === 0 && !uploading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div 
            className="w-16 h-16 mb-4 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)'
            }}
          >
            <Search className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'No Images Found' : 'No Images Yet'}
          </h3>
          <p className="text-white/60 text-center max-w-md">
            {searchTerm 
              ? 'No images match your search criteria. Try a different search term.' 
              : 'Start building your meme collection by uploading your first image!'
            }
          </p>
        </div>
      )}
    </div>
  );
}
