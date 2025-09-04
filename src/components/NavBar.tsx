"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className='flex justify-between items-center px-4 md:px-25 py-7 relative'>
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <Image src="/logo.png" alt="logo" width={106} height={21} />
      </Link>

      {/* Desktop Navigation */}
      <div className='hidden md:flex text-[#FAFAFA] font-medium items-center gap-6'>
        <Link 
          href="/" 
          className={`pb-1 transition-all duration-300 ${
            pathname === '/' 
              ? 'border-b-2' 
              : 'hover:border-b-2 border-transparent'
          }`}
          style={pathname === '/' ? {
            borderImage: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%) 1'
          } : {}}
        >
          CTO Memes
        </Link>
        <Link 
          href="/about" 
          className={`pb-1 transition-all duration-300 ${
            pathname === '/about' 
              ? 'border-b-2' 
              : 'hover:border-b-2 border-transparent'
          }`}
          style={pathname === '/about' ? {
            borderImage: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%) 1'
          } : {}}
        >
          About The <span>CTO</span> Lab
        </Link>
        <Link 
          href="/meme-dashboard" 
          className={`pb-1 transition-all duration-300 ${
            pathname === '/meme-dashboard' 
              ? 'border-b-2' 
              : 'hover:border-b-2 border-transparent'
          }`}
          style={pathname === '/meme-dashboard' ? {
            borderImage: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%) 1'
          } : {}}
        >
          Dashboard
        </Link>
      </div>

      {/* Desktop CTO Marketplace */}
      <Link className='hidden md:flex text-[#A3A3A3] font-medium items-center gap-2.5 rounded-lg p-2 border-[0.2px] border-[#FFFFFF]/20' href="/">
        CTO marketplace <Image src="/go-to.svg" alt="forward" width={15} height={15} />
      </Link>

      {/* Mobile CTO Marketplace - Center */}
      <Link className='md:hidden text-[#A3A3A3] font-medium flex items-center gap-2.5 rounded-lg p-2 border-[0.2px] border-[#FFFFFF]/20' href="/">
        CTO marketplace <Image src="/go-to.svg" alt="forward" width={15} height={15} />
      </Link>

      {/* Mobile Hamburger Menu */}
      <button
        onClick={toggleMenu}
        className='md:hidden text-white p-2'
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className='absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-[#FFFFFF]/20 md:hidden z-50'>
          <div className='flex flex-col p-4 space-y-4'>
            <Link 
              href="/" 
              className={`text-[#FAFAFA] font-medium py-2 hover:text-white transition-all duration-300 ${
                pathname === '/' 
                  ? 'border-b-2' 
                  : 'hover:border-b-2 border-transparent'
              }`}
              style={pathname === '/' ? {
                borderImage: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%) 1'
              } : {}}
              onClick={() => setIsMenuOpen(false)}
            >
              CTO Memes
            </Link>
            <Link 
              href="/about" 
              className={`text-[#FAFAFA] font-medium py-2 hover:text-white transition-all duration-300 ${
                pathname === '/about' 
                  ? 'border-b-2' 
                  : 'hover:border-b-2 border-transparent'
              }`}
              style={pathname === '/about' ? {
                borderImage: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%) 1'
              } : {}}
              onClick={() => setIsMenuOpen(false)}
            >
              About The <span>CTO</span> Lab
            </Link>
            <Link 
              href="/meme-dashboard" 
              className={`text-[#FAFAFA] font-medium py-2 hover:text-white transition-all duration-300 ${
                pathname === '/meme-dashboard' 
                  ? 'border-b-2' 
                  : 'hover:border-b-2 border-transparent'
              }`}
              style={pathname === '/meme-dashboard' ? {
                borderImage: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%) 1'
              } : {}}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
