import { getSession } from "next-auth/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin",
    prepareHeaders: async (headers) => {
      const session = await getSession(); // from NextAuth
      if (session?.user) {
        headers.set("Authorization", `Bearer ${session.accessToken}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `users?page=${page}&limit=${limit}`,
    }),
  }),
});

export const { useGetUsersQuery } = adminApi;
