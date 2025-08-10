"use client";

import { useSession } from "next-auth/react";

const DashboardPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>You are not logged in</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome {session.user.name || session.user.email}</h1>
      <p>You have successfully logged in!</p>
    </div>
  );
};

export default DashboardPage;
