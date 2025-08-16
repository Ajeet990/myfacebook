
"use client";

import { useFormik } from "formik";
import { loginValidationSchema } from "@/validations/loginValidation";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Link from "next/link";


export default function LoginPage() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        const res = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (!res.error) {
          toast.success("Logged in successfully.")
          const session = await getSession();
          // console.log("session:",session)

          if (session?.user?.role === 'ADMIN') {
            router.push("/admin/dashboard");
          } else {
            router.push("/");
          }
        } else {
          console.error("Login failed:", res.error);
          alert(res.error);
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong!");
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
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
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
