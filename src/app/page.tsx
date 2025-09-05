"use client";

import { Search, Download } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "../hooks/useApi";
import { MoonLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useImageStore, ImageData } from "../stores/imageStore";

export default function Home() {
  const { getImages, downloadImage } = useApi();
  const { 
    images, 
    filteredImages, 
    searchTerm, 
    loading, 
    hasAttemptedFetch,
    setImages, 
    setLoading, 
    setHasAttemptedFetch,
    searchImages 
  } = useImageStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we haven't attempted to fetch yet
    if (!hasAttemptedFetch) {
      const fetchImages = async () => {
        try {
          setLoading(true);
          setHasAttemptedFetch(true);
          const imageList = await getImages();
          setImages(imageList);
          // Only show "no images" message if we actually got an empty response
          if (imageList.length === 0) {
            toast.info('No images available. Check back later!');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load images';
          console.error("Failed to load images:", error);
          toast.error(`Failed to load images: ${errorMessage}`);
        } finally {
          setLoading(false);
        }
      };

      fetchImages();
    }
  }, [getImages, setImages, setLoading, setHasAttemptedFetch, hasAttemptedFetch]);

  const handleSearch = useCallback(
    (term: string) => {
      searchImages(term);
    },
    [searchImages]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDownload = useCallback(async (image: ImageData) => {
    try {
      setDownloadingImageId(image.id);
      const blob = await downloadImage(image.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.originalName || `image-${image.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloadingImageId(null);
    }
  }, [downloadImage]);


  if (loading) {
    return (
      <div className=" p-10 md:p-25 pb-0 mb-20">
        <div className="flex flex-col md:flex-row gap-5 items-center justify-between mb-8">
          <h1 className="font-bold text-[32px]">CTO Marketplace memes</h1>
          <div className="flex items-center justify-between relative">
            <Search color="#FFFFFF50" size={16} className="absolute left-2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="search memes"
              className="w-full md:w-[371px] pl-8 rounded-lg border-[0.2px] border-[#FFFFFF]/20 h-[51px] placeholder:text-[#FFFFFF]/50 bg-transparent text-white"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <span className="rounded-[4px] bg-[#FFFFFF]/5 absolute right-2 text-[#FFFFFF]/50 text-xs py-1.5 px-1">
              Ctrl k
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-5 items-center justify-center h-64">
          <div className="text-white/50">Loading memes...</div>
          <MoonLoader size={20} color="#FFFFFF" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 md:p-25 pb-0 mb-20">
      <div className="flex flex-col md:flex-row gap-5 items-center justify-between mb-12">
        <h1 className="font-bold text-[32px]">CTO Marketplace memes</h1>

        <div className="flex items-center justify-between relative">
          <Search color="#FFFFFF50" size={16} className="absolute left-2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="search memes"
            className="w-full md:w-[371px] pl-8 rounded-lg border-[0.2px] border-[#FFFFFF]/20 h-[51px] placeholder:text-[#FFFFFF]/50 bg-transparent text-white"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <span className="rounded-[4px] bg-[#FFFFFF]/5 absolute right-2 text-[#FFFFFF]/50 text-xs py-1.5 px-1">
            Ctrl k
          </span>
        </div>
      </div>

      {/* Images Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  2xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative group size-[300px] sm:size-[200px] lg:size-[250px]"
            >
              <Image
                src={image.url}
                alt={image.originalName}
                fill
                className="object-cover border border-[#262626] rounded-[6px] hover:scale-105 transition-transform duration-200 cursor-pointer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              {/* Hover overlay with image name and download button */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image);
                    }}
                    disabled={downloadingImageId === image.id}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={downloadingImageId === image.id ? "Downloading..." : "Download image"}
                  >
                    {downloadingImageId === image.id ? (
                      <MoonLoader size={16} color="#FFFFFF" />
                    ) : (
                      <Download size={16} className="text-white" />
                    )}
                  </button>
                </div>
                <span className="text-white text-sm truncate">
                  {image.originalName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredImages.length === 0 && !loading && (
        <div className="text-center text-white/50 py-12">
          {searchTerm
            ? "No memes found matching your search."
            : "No memes available yet."}
        </div>
      )}

    </div>
  );
}
