"use client";

import { useSession } from "next-auth/react";
import UserLayout from "./(user)/layout";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function HomePage() {
  return (
    <UserLayout>
      <Posts />
    </UserLayout>
  );
}

function Posts() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentPostId, setCommentPostId] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/get-all-post");
        
        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json(); // ✅ parse body
        // console.log("Posts data:", data);

        setPosts(data.data.posts || []); // assuming your API sends { data: { posts: [...] } }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error fetching posts: {error}</p>;

  const handleLike = (postId) => {
    if (status !== "authenticated") {
      // alert("Please log in to like posts");
      toast.error("Please log in to like posts");
      return;
    }
    console.log("Liked post", postId);
    // TODO: Call like API here
  };

  const handleComment = (postId) => {
    if (status !== "authenticated") {
      toast.error("Please log in to comment on posts");
      return;
    }
    setCommentPostId(postId);
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Latest Posts</h1>
      {posts.map((post) => (
        <div key={post.id} className="border rounded p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{post.author.name}</span>
            <span className="text-gray-500 text-sm">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>

          {post.text && <p className="mb-2">{post.text}</p>}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post"
              className="max-w-full rounded mb-2"
            />
          )}

          <div className="flex gap-4 mt-2">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => handleLike(post.id)}
            >
              👍 Like ({post.likes.length})
            </button>
            <button
              className="text-green-600 hover:underline"
              onClick={() => handleComment(post.id)}
            >
              💬 Comment ({post.comments.length})
            </button>
          </div>
        </div>
      ))}

      {commentPostId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Comment</h2>
            <textarea
              placeholder="Write your comment..."
              className="w-full border rounded p-2 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setCommentPostId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Comment submitted for", commentPostId);
                  setCommentPostId(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
