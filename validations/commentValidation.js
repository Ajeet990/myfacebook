import * as Yup from "yup";

/**
 * Login validation schema
 * - Email: must be valid
 * - Password: min 6 characters
 */
export const commentValidationSchema = Yup.object().shape({
  text: Yup.string()
    .min(2, "Comment must be at least 2 characters")
    .max(500, "Comment cannot exceed 500 characters")
    .required("Comment is required"),
});
