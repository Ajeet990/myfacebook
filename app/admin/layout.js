// import Sidebar from "@/app/components/admin/Sidebar";
import Sidebar from "./components/admin/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        {children}
      </div>
    </div>
  );
}
