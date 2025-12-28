'use client';

import { useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Upload, Edit3, Trash2 } from 'lucide-react';
import { useMemes, useDeleteMeme, useUploadMeme, useUpdateMeme } from '@/hooks/useMemes';
import { getCloudFrontUrl } from '@/lib/cloudfront';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { Meme } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: memes, isLoading } = useMemes();
  const deleteMutation = useDeleteMeme();
  const uploadMutation = useUploadMeme();
  const updateMutation = useUpdateMeme();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingMeme, setEditingMeme] = useState<Meme | null>(null);
  const [editForm, setEditForm] = useState({ filename: '', description: '', category: '' });
  const [dragActive, setDragActive] = useState(false);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredMemes = memes?.filter((meme) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      meme.filename?.toLowerCase().includes(term) ||
      meme.originalName?.toLowerCase().includes(term)
    );
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) {
      toast.error('Please select valid image files');
      return;
    }

    for (const file of imageFiles) {
      await uploadMutation.mutateAsync(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleEditClick = (meme: Meme) => {
    setEditingMeme(meme);
    setEditForm({
      filename: meme.filename || '',
      description: meme.description || '',
      category: meme.category || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeme) return;

    await updateMutation.mutateAsync({
      id: editingMeme.id,
      data: editForm,
    });
    setEditingMeme(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Meme Management Dashboard</h1>

        {/* Search */}
        <div className="flex items-center relative">
          <Search className="absolute left-3 text-white/50" size={16} />
          <input
            type="text"
            placeholder="Search images..."
            className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-transparent text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-white/60">
            {session?.user?.email}
          </span>
          <Link href="/admin">
            <Button variant="secondary" size="sm">
              🛡️ Admin
            </Button>
          </Link>
          <Button onClick={() => signOut()} size="sm">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-white/50" />
        <p className="text-lg mb-4">Drag & drop images here or click to select</p>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <span
            className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 px-4 py-2 text-white hover:scale-105 ${
              uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)',
            }}
          >
            {uploadMutation.isPending ? (
              <>
                <Spinner size="sm" />
                <span className="ml-2">Uploading...</span>
              </>
            ) : (
              'Select Images'
            )}
          </span>
        </label>
      </div>

      {/* Images Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="text-white/60 mt-4">Loading images...</p>
        </div>
      ) : filteredMemes?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMemes.map((meme) => (
            <Card key={meme.id} className="p-3">
              <div className="aspect-square bg-[#262626] rounded mb-3 relative overflow-hidden">
                <Image
                  src={getCloudFrontUrl(meme.url)}
                  alt={meme.filename || meme.originalName}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold truncate text-white text-sm">
                  {meme.filename || meme.originalName}
                </h3>
                <p className="text-xs text-white/50">
                  {(meme.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex gap-1">
                  <a
                    href={getCloudFrontUrl(meme.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs text-center transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleEditClick(meme)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(meme.id)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-2 py-1 rounded text-xs flex items-center justify-center transition-colors"
                  >
                    {deleteMutation.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 mb-4 rounded-full gradient-bg flex items-center justify-center">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'No Images Found' : 'No Images Yet'}
          </h3>
          <p className="text-white/60 text-center max-w-md">
            {searchTerm
              ? 'No images match your search criteria.'
              : 'Upload your first image to get started!'}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingMeme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Image</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.filename}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, filename: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded text-white focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={updateMutation.isPending}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingMeme(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

