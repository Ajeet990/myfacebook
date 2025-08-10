"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useGetPostsQuery, useCreatePostMutation } from "@/src/services/postsApi";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function MyPostsPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const { data, error, isLoading, refetch } = useGetPostsQuery(userId, {
    skip: status !== "authenticated",
  });

  const [createPost] = useCreatePostMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  // Validation: either text OR image is required
  const validationSchema = Yup.object().shape({
    text: Yup.string(),
    image: Yup.mixed(),
  }).test(
    "at-least-one",
    "You must provide text or image",
    (values) => !!values.text || !!values.image
  );

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("text", values.text);
      formData.append("authorId", userId);
      if (values.image) {
        formData.append("image", values.image);
      }

      await createPost(formData).unwrap();

      resetForm();
      setIsModalOpen(false);
      setPreview(null);
      refetch();
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  if (status === "loading") return <p>Checking authentication...</p>;
  if (status === "unauthenticated")
    return <p>You must be logged in to see your posts.</p>;

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error fetching posts.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Add New Post
        </button>
      </div>

      {/* Posts Table */}
      {data?.posts?.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Text</th>
                <th className="border px-4 py-2 text-left">Image</th>
                <th className="border px-4 py-2 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {data?.posts?.map((post) => (
                <tr key={post.id}>
                  <td className="border px-4 py-2">{post.text || "-"}</td>
                  <td className="border px-4 py-2">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        className="h-12 w-12 object-cover rounded"
                        alt="Post"
                      />
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(post.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Post</h2>
            <Formik
              initialValues={{ text: "", image: null }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue, isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block font-medium">Text</label>
                    <Field
                      name="text"
                      as="textarea"
                      className="w-full border rounded p-2"
                      placeholder="Write something..."
                    />
                    <ErrorMessage
                      name="text"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Image</label>
                    <input
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFieldValue("image", file);
                        setPreview(file ? URL.createObjectURL(file) : null);
                      }}
                      className="w-full border rounded p-2"
                    />
                    {preview && (
                      <img src={preview} alt="Preview" className="mt-2 max-h-40 rounded" />
                    )}
                    <ErrorMessage
                      name="image"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {isSubmitting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
}
