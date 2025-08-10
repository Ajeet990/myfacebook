import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: (userId) => (userId ? `posts?userId=${userId}` : "posts"),
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

export const { useGetPostsQuery, useCreatePostMutation } = postsApi;
