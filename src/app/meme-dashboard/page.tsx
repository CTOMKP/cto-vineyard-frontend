"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useApi } from '../../hooks/useApi';
import { MoonLoader } from 'react-spinners';
import { Search, Upload, CheckCircle, XCircle, AlertCircle, Edit3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface ImageData {
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

export default function ImageDashboard() {
  const { data: session, status } = useSession();
  const { uploadImage, deleteImage, getImages, editImage, isAuthenticated } = useApi();
  const [images, setImages] = useState<ImageData[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [editForm, setEditForm] = useState({ originalName: '', description: '', category: '' });
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: {
      status: 'pending' | 'uploading' | 'success' | 'error';
      progress: number;
      error?: string;
    }
  }>({});

  useEffect(() => {
    if (isAuthenticated) {
      loadImages();
    }
  }, [isAuthenticated]);

  const loadImages = async () => {
    setLoadingImages(true);
    try {
      const imageList = await getImages();
      
      // Ensure we have a valid array
      if (Array.isArray(imageList)) {
        setImages(imageList);
        setFilteredImages(imageList);
        if (imageList.length === 0) {
          toast.info('No images found. Upload some images to get started!');
        }
      } else {
        console.error('Invalid image list received:', imageList);
        setImages([]);
        setFilteredImages([]);
        toast.error('Invalid response from server. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load images';
      console.error('Failed to load images:', error);
      setImages([]);
      setFilteredImages([]);
      toast.error(`Failed to load images: ${errorMessage}`);
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

    const filtered = images.filter(image => {
      const searchText = (image.filename || image.originalName).toLowerCase();
      return searchText.includes(term.toLowerCase());
    });
    setFilteredImages(filtered);
  }, [images]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (fileArray.length === 0) {
      toast.error('Please select valid image files only.');
      return;
    }

    setUploading(true);
    
    // Initialize progress tracking for all files
    const initialProgress: typeof uploadProgress = {};
    fileArray.forEach(file => {
      initialProgress[file.name] = {
        status: 'pending',
        progress: 0
      };
    });
    setUploadProgress(initialProgress);

    let successCount = 0;
    let errorCount = 0;

    // Process files sequentially for better user experience
    for (const file of fileArray) {
      const fileName = file.name;
      
      try {
        // Update status to uploading
        setUploadProgress(prev => ({
          ...prev,
          [fileName]: { status: 'uploading', progress: 50 }
        }));

        await uploadImage(file);
        
        // Update status to success
        setUploadProgress(prev => ({
          ...prev,
          [fileName]: { status: 'success', progress: 100 }
        }));

        successCount++;
        toast.success(`✅ ${fileName} uploaded successfully!`);
        
        // Small delay between uploads for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        // Update status to error
        setUploadProgress(prev => ({
          ...prev,
          [fileName]: { 
            status: 'error', 
            progress: 0, 
            error: errorMessage 
          }
        }));

        errorCount++;
        toast.error(`❌ Failed to upload ${fileName}: ${errorMessage}`);
      }
    }

    // Show summary toast
    if (successCount > 0 && errorCount === 0) {
      toast.success(`🎉 All ${successCount} images uploaded successfully!`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`⚠️ ${successCount} uploaded, ${errorCount} failed`);
    } else {
      toast.error(`❌ All ${errorCount} uploads failed`);
    }

    // Reload images if any were successful
    if (successCount > 0) {
      await loadImages();
    }

    // Clear progress after a delay
    setTimeout(() => {
      setUploadProgress({});
    }, 3000);

    setUploading(false);
  };

  const handleDelete = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImage(imageId);
        toast.success('Image deleted successfully!');
        await loadImages();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Delete failed';
        console.error('Delete failed:', error);
        toast.error(`Failed to delete image: ${errorMessage}`);
      }
    }
  };

  const handleEditClick = useCallback((image: ImageData) => {
    setEditingImage(image);
    setEditForm({
      originalName: image.originalName || '',
      description: image.description || '',
      category: image.category || ''
    });
  }, []);

  const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      await editImage(editingImage.id, editForm);
      toast.success('Image updated successfully!');
      
      // Update the local state
      setImages(prev => prev.map(img => 
        img.id === editingImage.id 
          ? { ...img, ...editForm }
          : img
      ));
      setFilteredImages(prev => prev.map(img => 
        img.id === editingImage.id 
          ? { ...img, ...editForm }
          : img
      ));
      
      setEditingImage(null);
      setEditForm({ originalName: '', description: '', category: '' });
    } catch (error) {
      console.error('Edit failed:', error);
      toast.error('Failed to update image');
    }
  }, [editingImage, editForm, editImage]);

  const handleEditCancel = useCallback(() => {
    setEditingImage(null);
    setEditForm({ originalName: '', description: '', category: '' });
  }, []);

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
        
        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Progress:</h4>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="flex items-center space-x-3 text-sm">
                <div className="flex-shrink-0">
                  {progress.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {progress.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                  {progress.status === 'uploading' && <Upload className="w-4 h-4 text-blue-500 animate-pulse" />}
                  {progress.status === 'pending' && <AlertCircle className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-gray-600">{fileName}</p>
                  {progress.status === 'error' && progress.error && (
                    <p className="text-red-500 text-xs">{progress.error}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {progress.status === 'uploading' && (
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  )}
                  {progress.status === 'success' && (
                    <span className="text-green-500 text-xs">Done</span>
                  )}
                  {progress.status === 'error' && (
                    <span className="text-red-500 text-xs">Failed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
                <h3 className="font-semibold truncate text-white text-sm">
                  {image.filename || image.originalName}
                </h3>
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
                    onClick={() => handleEditClick(image)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex-1 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>
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

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white text-lg font-semibold mb-4">Edit Image</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.originalName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, originalName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                  placeholder="Image name"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded text-white placeholder-white/50 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Image description"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                  placeholder="Image category"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="flex-1 bg-[#404040] hover:bg-[#505050] text-white py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
