'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'CTO Memes' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const isActive = (href: string) => pathname === href;

  const gradientBorder = {
    borderImage: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%) 1',
  };

  return (
    <nav className="flex justify-between items-center px-4 md:px-[100px] py-7 relative">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <Image src="/logo.png" alt="CTO Vineyard" width={106} height={21} priority />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex text-[#FAFAFA] font-medium items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`pb-1 transition-all duration-300 ${
              isActive(link.href)
                ? 'border-b-2'
                : 'hover:border-b-2 border-transparent'
            }`}
            style={isActive(link.href) ? gradientBorder : {}}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Desktop CTA */}
      <Link
        href="/"
        className="hidden md:flex text-[#A3A3A3] font-medium items-center gap-2.5 rounded-lg p-2 border border-white/20 hover:border-white/40 transition-colors"
      >
        CTO marketplace
        <Image src="/go-to.svg" alt="" width={15} height={15} />
      </Link>

      {/* Mobile CTA */}
      <Link
        href="/"
        className="md:hidden text-[#A3A3A3] font-medium flex items-center gap-2.5 rounded-lg p-2 border border-white/20"
      >
        CTO marketplace
        <Image src="/go-to.svg" alt="" width={15} height={15} />
      </Link>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden text-white p-2"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/20 md:hidden z-50">
          <div className="flex flex-col p-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[#FAFAFA] font-medium py-2 transition-all duration-300 ${
                  isActive(link.href) ? 'border-b-2' : ''
                }`}
                style={isActive(link.href) ? gradientBorder : {}}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

