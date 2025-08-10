"use client";

// import TopNavbar from "./components/TopNavbar";
import TopNavbar from "./components/TopNavBar";

export default function UserLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavbar />
      <main className="flex-1 pt-4 px-20 bg-gray-100">{children}</main>
    </div>
  );
}
