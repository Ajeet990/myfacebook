"use client";

import { useSession } from "next-auth/react";
import UserLayout from "./(user)/layout";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLikePostMutation } from "@/src/services/postsApi";

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
  const [likingPostId, setLikingPostId] = useState(null); // Track which post is being liked

  const [likePost, { isLoading: likeLoading }] = useLikePostMutation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/get-all-post");

        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        setPosts(data.data.posts || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p className="text-red-500">Error fetching posts: {error}</p>;

  // Helper function to check if current user has liked a post
  const isPostLikedByUser = (post) => {
    if (!session?.user?.id) return false;
    return post.likes.some(like => like.userId === session.user.id);
  };

  const handleLike = async (postId) => {
    if (status !== "authenticated") {
      toast.error("Please log in to like posts");
      return;
    }

    // Prevent multiple simultaneous like requests for the same post
    if (likingPostId === postId) return;

    setLikingPostId(postId);

    try {
      const res = await likePost({ postId, userId: session.user.id }).unwrap();
      
      // Update UI based on API response
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            if (res.data.liked) {
              // Post was liked - add the like
              return {
                ...post,
                likes: [...post.likes, { userId: session.user.id }]
              };
            } else {
              // Post was unliked - remove the like
              return {
                ...post,
                likes: post.likes.filter(like => like.userId !== session.user.id)
              };
            }
          }
          return post;
        })
      );

      // Show success message
      toast.success(res.message);
      
    } catch (err) {
      console.error("Like API error:", err);
      toast.error(err?.data?.message || "Failed to update like");
    } finally {
      setLikingPostId(null);
    }
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
      {posts.map((post) => {
        const isLiked = isPostLikedByUser(post);
        const isCurrentlyLiking = likingPostId === post.id;
        
        return (
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
                disabled={isCurrentlyLiking}
                className={`hover:underline disabled:opacity-50 transition-colors ${
                  isLiked ? 'text-blue-600 font-semibold' : 'text-gray-600'
                } ${isCurrentlyLiking ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => handleLike(post.id)}
              >
                {isCurrentlyLiking ? (
                  '⏳ ...'
                ) : (
                  <>
                    {isLiked ? '👍' : '🤍'} {isLiked ? 'Liked' : 'Like'} ({post.likes.length})
                  </>
                )}
              </button>
              <button
                className="text-green-600 hover:underline"
                onClick={() => handleComment(post.id)}
              >
                💬 Comment ({post.comments.length})
              </button>
            </div>
          </div>
        );
      })}

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