import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
    }),
    getSession: builder.query({
      query: () => "auth/session",
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "register",
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useGetSessionQuery, useRegisterMutation } = authApi;
