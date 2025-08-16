"use client";

import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { registerValidationSchema } from "@/validations/registerValidation";
// import { useRegisterMutation } from "@/src/services/auth/authApi";
import { useRegisterMutation } from "@/src/services/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const formik = useFormik({
    initialValues: { name: "", email: "", phone: "", password: "" },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        const res = await registerUser(values).unwrap(); // unwrap to catch errors properly

        if (res.success) {
          toast.success("Account created successfully!");
          router.push("/login");
        } else {
          toast.error(res.message || "Registration failed");
        }
      } catch (err) {
        console.error("Register error:", err);
        toast.error(err?.data?.message || "Something went wrong!");
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formik.errors.name && formik.touched.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formik.errors.email && formik.touched.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formik.errors.phone && formik.touched.phone && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formik.errors.password && formik.touched.password && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
