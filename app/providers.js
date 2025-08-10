"use client";

import { Provider as ReduxProvider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { store } from "./store";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        {children}
        <Toaster position="top-right" />
      </ReduxProvider>
    </SessionProvider>
  );
}
