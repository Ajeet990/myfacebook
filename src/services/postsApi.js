import { getSession } from "next-auth/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: async (headers) => {
      const session = await getSession(); // from NextAuth
      if (session?.user) {
        headers.set("Authorization", `Bearer ${session.accessToken}`); // or session.accessToken if you store it
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: (userId) => (userId ? `posts?userId=${userId}` : "posts"),
    }),
    getAllPosts: builder.query({
      query: () => "posts",
    }),
    createPost: builder.mutation({
      query: (formData) => ({
        url: "posts",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useGetAllPostsQuery
} = postsApi;
