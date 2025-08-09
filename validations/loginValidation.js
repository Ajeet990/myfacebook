import * as Yup from "yup";

/**
 * Login validation schema
 * - Email: must be valid
 * - Password: min 6 characters
 */
export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});
