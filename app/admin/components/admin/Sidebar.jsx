"use client";
import { useState } from "react";
import { FaBars, FaTachometerAlt, FaUser, FaCog } from "react-icons/fa";
import Link from "next/link";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-800 text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          <FaBars size={20} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4">
        <Link href="/admin/dashboard" className="flex items-center p-3 hover:bg-gray-700">
          <FaTachometerAlt className="mr-2" />
          {!isCollapsed && "Dashboard"}
        </Link>
        <Link href="/admin/users" className="flex items-center p-3 hover:bg-gray-700">
          <FaUser className="mr-2" />
          {!isCollapsed && "Users"}
        </Link>
        <Link href="/admin/settings" className="flex items-center p-3 hover:bg-gray-700">
          <FaCog className="mr-2" />
          {!isCollapsed && "Settings"}
        </Link>
      </nav>
    </div>
  );
}
