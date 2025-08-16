"use client";
import { useState } from "react";
import { useGetUsersQuery } from "@/src/services/admin/adminApi";
import Paginate from "../components/paginate/paginate";

const Users = () => {
  const [page, setPage] = useState(1);

  // ✅ now pass { page, limit } as argument
  const { data, isLoading, error } = useGetUsersQuery({ page, limit: 5 });

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">Error fetching users</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Users</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Posts Count</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.users?.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{user.id}</td>
              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              <td className="border border-gray-300 px-4 py-2">{user.role}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.posts?.length || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Reusable paginate component */}
      <Paginate
        currentPage={data?.data?.pagination?.currentPage || 1}
        totalPages={data?.data?.pagination?.totalPages || 1}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default Users;
