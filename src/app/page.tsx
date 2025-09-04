"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "../hooks/useApi";
import { MoonLoader } from "react-spinners";

interface ImageData {
  id: string;
  url: string;
  originalName: string;
  size: number;
  uploadDate: string;
}

export default function Home() {
  const { getImages } = useApi();
  const [images, setImages] = useState<ImageData[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imageList = await getImages();
        setImages(imageList);
        setFilteredImages(imageList);
      } catch (error) {
        console.error("Failed to load images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [getImages]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (!term.trim()) {
        setFilteredImages(images);
        return;
      }

      const filtered = images.filter((image) =>
        image.originalName.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredImages(filtered);
    },
    [images]
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  2xl:grid-cols- gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative group size-[150px] sm:size-[200px] lg:size-[300px]"
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
              {/* Hover overlay with image name */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-end p-2">
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
