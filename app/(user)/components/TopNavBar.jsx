"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TopNavbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const userName = session?.user?.name || session?.user?.email || "User";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    signOut({ callbackUrl: "/login" });
  };

  // Helper to check if link is active
  const isActive = (href) => {
    // for exact match or you can do startsWith for nested routes
    return pathname === href;
  };

  const linkClassName = (href) =>
    `font-medium ${
      isActive(href) ? "text-blue-600 underline" : "text-gray-700 hover:text-blue-600"
    }`;

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Left navigation links */}
      <div className="flex space-x-6">
        <Link href="/" className={linkClassName("/")}>
          Home
        </Link>
        <Link href="/my-posts" className={linkClassName("/my-posts")}>
          My Posts
        </Link>
        <Link href="/contact-us" className={linkClassName("/contact-us")}>
          Contact Us
        </Link>
        <Link href="/profile" className={linkClassName("/profile")}>
          Profile
        </Link>
        <Link href="/about" className={linkClassName("/about")}>
          About
        </Link>
        <Link href="/chat-ai" className={linkClassName("/chat-ai")}>
          Chat AI
        </Link>
      </div>

      {/* Right user info */}
      <div className="relative flex items-center space-x-3" ref={dropdownRef}>
        {status === "authenticated" ? (
          <>
            <span className="text-gray-700 font-semibold whitespace-nowrap">
              Welcome, {userName}
            </span>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold select-none focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              title={userName}
            >
              {initials}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
