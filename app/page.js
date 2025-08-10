import React from "react";
// import UserLayout from "./(user)/layout";
import UserLayout from "./(user)/layout";

const Posts = () => {
  return <div>This is home page. Will list all posts</div>;
};

export default function HomePage() {
  return (
    <UserLayout>
      <Posts />
    </UserLayout>
  );
}
