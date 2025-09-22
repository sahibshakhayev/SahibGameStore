"use client";

import Link from "next/link";
import { useAuth } from "../features/account/useAuth";
import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from "react";
import { Search, GamepadIcon, Heart, ShoppingCart, Home, Grid3X3, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

const Header: React.FC = () => {
  const { userName, logoutUser } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock cart/favorite counts for now
  const cartCount = 3;
  const favoriteCount = 5;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logoutUser();
    setDropdownOpen(false);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <GamepadIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">
              Sahib <span className="text-cyan-400">Game Store</span>
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                pathname === "/"
                  ? "bg-cyan-600 text-white"
                  : "text-gray-300 hover:text-cyan-400 hover:bg-gray-700"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/games"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                pathname === "/games"
                  ? "bg-cyan-600 text-white"
                  : "text-gray-300 hover:text-cyan-400 hover:bg-gray-700"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>All Games</span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {userName ? (
              <>
                {/* Favorites */}
                <Link href="/favorites">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-cyan-400 hover:bg-gray-700 transition-colors relative"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Cart */}
                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-cyan-400 hover:bg-gray-700 transition-colors relative"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 hover:bg-gray-700"
                  >
                    <div className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">{userName}</p>
                        <p className="text-xs text-gray-400">Signed in</p>
                      </div>

                      <Link
                        href="/account"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 hover:bg-gray-800 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>

                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 hover:bg-gray-800 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Grid3X3 className="h-4 w-4 mr-3" />
                        My Orders
                      </Link>

                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors w-full"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" className="text-gray-300 hover:text-cyan-400 hover:bg-gray-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
