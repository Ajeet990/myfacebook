"use client";
import { useState } from "react";
import { FaBars, FaTachometerAlt, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-800 text-white transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"
        }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          <FaBars size={20} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 flex flex-col justify-between h-[calc(100%-3rem)]">
        <div>
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
        </div>

        {/* Logout */}
        {
          session?.user?.name && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center p-3 hover:bg-gray-700"
            >
              <FaSignOutAlt className="mr-2" />
              {!isCollapsed && "Logout"}
            </button>
          )
        }

      </nav>
    </div>
  );
}
