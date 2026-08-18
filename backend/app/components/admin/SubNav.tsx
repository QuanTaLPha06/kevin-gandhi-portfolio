"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// SubNav is hidden when the user is not authenticated. We check /api/auth/me
// on mount and only render navigation when the user is authenticated.

export default function SubNav() {
  const path = usePathname() || '';
  const isActive = (p: string) => path.startsWith(p);
  const [authed, setAuthed] = useState<boolean | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => {
        if (!mounted) return;
        setAuthed(r.ok);
      })
      .catch(() => mounted && setAuthed(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (authed === undefined) return null; // avoid flicker
  if (!authed) return null;

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/projects', label: 'Projects' },
    { href: '/admin/blogs', label: 'Blogs' },
    { href: '/admin/certifications', label: 'Certifications' },
    { href: '/admin/profile', label: 'Profile' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/guestbook', label: 'Guestbook' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <nav className="w-full border-b" style={{ borderColor: '#e5e7eb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-3 inline-block ${isActive(link.href) ? 'font-semibold border-b-2' : 'text-gray-600'}`}
              style={{ borderColor: '#f59e0b' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full py-3 text-left flex items-center justify-between text-gray-600"
          >
            <span className="font-medium">
              {navLinks.find(link => isActive(link.href))?.label || 'Menu'}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mobileMenuOpen && (
            <div className="py-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-sm ${isActive(link.href)
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
