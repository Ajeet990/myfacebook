"use client";

import { useSession } from "next-auth/react";
import UserLayout from "./(user)/layout";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useLikePostMutation,
  useGetPostCommentsQuery,
  useCommentOnPostMutation,
} from "@/src/services/postsApi";
import { commentValidationSchema } from "@/validations/commentValidation";

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
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(""); // ✅ Store inline error
  const [likingPostId, setLikingPostId] = useState(null);

  const [likePost] = useLikePostMutation();
  const [commentOnPost, { isLoading: commentLoading }] =
    useCommentOnPostMutation();
  const { data: commentsData, refetch, isFetching: commentsLoading } = useGetPostCommentsQuery(commentPostId, {
    skip: !commentPostId, // Only run if we have a postId
  });
  // const { data: commentsData, isFetching: commentsLoading } =
  //   useGetPostCommentsQuery(commentPostId, {
  //     skip: !commentPostId,
  //   });

  useEffect(() => {
    if (commentPostId) {
      refetch(); // Force latest data when modal opens
    }
  }, [commentPostId, refetch]);

  
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

  const isPostLikedByUser = (post) => {
    if (!session?.user?.id) return false;
    return post.likes.some((like) => like.userId === session.user.id);
  };

  const handleLike = async (postId) => {
    if (status !== "authenticated") {
      toast.error("Please log in to like posts");
      return;
    }
    if (likingPostId === postId) return;

    setLikingPostId(postId);
    try {
      const res = await likePost({ postId, userId: session.user.id }).unwrap();

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            if (res.data.liked) {
              return {
                ...post,
                likes: [...post.likes, { userId: session.user.id }],
              };
            } else {
              return {
                ...post,
                likes: post.likes.filter(
                  (like) => like.userId !== session.user.id
                ),
              };
            }
          }
          return post;
        })
      );
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
    setCommentText("");
    setCommentError(""); // ✅ Reset error
  };

  const handleSubmitComment = async () => {
    try {
      // ✅ Validate comment text
      await commentValidationSchema.validate(
        { text: commentText },
        { abortEarly: false }
      );

      // ✅ Clear error if validation passes
      setCommentError("");

      const res = await commentOnPost({
        postId: commentPostId,
        userId: session.user.id,
        text: commentText,
      }).unwrap();

      toast.success(res.message || "Comment posted");

      // ✅ Update comment count in UI immediately
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === commentPostId
            ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: res.data.id, // from API
                  text: res.data.text,
                  user: { id: session.user.id, name: session.user.name },
                },
              ],
            }
            : post
        )
      );

      // ✅ Clear comment box & close modal
      setCommentText("");
      setCommentPostId(null);
    } catch (err) {
      if (err.name === "ValidationError") {
        // ✅ Show inline error instead of closing modal
        setCommentError(err.errors[0]);
      } else {
        console.error("Comment API error:", err);
        toast.error(err?.data?.message || "Failed to post comment");
      }
    }
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
                className={`hover:underline disabled:opacity-50 transition-colors ${isLiked
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
                  } ${isCurrentlyLiking
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                  }`}
                onClick={() => handleLike(post.id)}
              >
                {isCurrentlyLiking ? (
                  "⏳ ..."
                ) : (
                  <>
                    {isLiked ? "👍" : "🤍"} {isLiked ? "Liked" : "Like"} (
                    {post.likes.length})
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Comments</h2>

            {commentsLoading && <p>Loading comments...</p>}
            {commentsData?.error && (
              <p className="text-red-500">Failed to load comments</p>
            )}

            {commentsData?.data?.comments?.length > 0 ? (
              <ul className="mb-4 space-y-2 max-h-60 overflow-y-auto">
                {commentsData.data.comments.map((comment) => (
                  <li key={comment.id} className="border-b pb-1">
                    <strong>{comment.user.name}</strong>: {comment.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-gray-500">No comments yet</p>
            )}

            <textarea
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full border rounded p-2 mb-1"
            />
            {commentError && (
              <p className="text-red-500 text-sm mb-2">{commentError}</p>
            )}

            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setCommentPostId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                disabled={commentLoading}
                onClick={handleSubmitComment}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {commentLoading ? "Posting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
