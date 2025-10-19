'use client';

import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Abrir menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  role="img"
                  aria-label="Menu Principal"
                >
                  <title>Menu Principal</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center">
            {/* Add notifications, user menu, etc. here */}
          </div>
        </div>
      </div>
    </header>
  );
}