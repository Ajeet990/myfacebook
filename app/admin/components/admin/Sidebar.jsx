"use client";
import { useState } from "react";
import { FaBars, FaTachometerAlt, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function Sidebar() {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogOut = async () => {
    await signOut({ redirect: false });
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  const menuItems = [
    { href: "/admin/dashboard", icon: <FaTachometerAlt className="mr-2" />, label: "Dashboard" },
    { href: "/admin/users", icon: <FaUser className="mr-2" />, label: "Users" },
    { href: "/admin/settings", icon: <FaCog className="mr-2" />, label: "Settings" },
  ];

  return (
    <div
      className={`h-screen bg-gray-800 text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/logo.webp" // place your logo in public/logo/logo.webp
            alt="MyFacebook Logo"
            width={32}
            height={32}
            className="rounded"
          />
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-wide">myfacebook</span>
          )}
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          <FaBars size={20} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 flex flex-col justify-between h-[calc(100%-4rem)]">
        <div>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-3 hover:bg-gray-700 transition-colors ${
                  isActive ? "bg-gray-700 border-l-4 border-blue-500" : ""
                }`}
              >
                {item.icon}
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        {session?.user?.name && (
          <button
            onClick={handleLogOut}
            className="flex items-center p-3 hover:bg-gray-700"
          >
            <FaSignOutAlt className="mr-2" />
            {!isCollapsed && "Logout"}
          </button>
        )}
      </nav>
    </div>
  );
}
