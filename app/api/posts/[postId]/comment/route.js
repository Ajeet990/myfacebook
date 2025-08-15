// app/api/posts/[postId]/comment/route.js
import prisma from "@/app/lib/prisma";
import { sendResponse } from "@/app/lib/apiResponses";
import { z } from "zod";

// ✅ Validation for URL params
const ParamsSchema = z.object({
  postId: z.coerce.number().int().positive({ message: "postId must be a positive integer" }),
});

// ✅ Validation for request body
const BodySchema = z.object({
  userId: z.coerce.number().int().positive({ message: "userId must be a positive integer" }),
  text: z.string().trim().min(1, { message: "Comment text cannot be empty" }),
});

/**
 * GET - Fetch all comments for a post
 */
export async function GET(request, { params }) {
  const parsedParams = ParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    return sendResponse({
      success: false,
      message: "Validation failed",
      data: parsedParams.error.errors.map((e) => e.message),
      status: 400,
    });
  }

  const { postId } = parsedParams.data;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return sendResponse({
      success: true,
      message: "Comments fetched successfully",
      data: { comments },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return sendResponse({
      success: false,
      message: "Failed to fetch comments",
      status: 500,
    });
  }
}

/**
 * POST - Add a comment to a post
 */
export async function POST(request, { params }) {
  // ✅ Validate params
  const parsedParams = ParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    return sendResponse({
      success: false,
      message: "Validation failed",
      data: parsedParams.error.errors.map((e) => e.message),
      status: 400,
    });
  }

  // ✅ Validate body
  const body = await request.json();
  const parsedBody = BodySchema.safeParse(body);
  if (!parsedBody.success) {
    return sendResponse({
      success: false,
      message: "Validation failed",
      data: parsedBody.error.errors.map((e) => e.message),
      status: 400,
    });
  }

  const { postId } = parsedParams.data;
  const { userId, text } = parsedBody.data;

  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        postId,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Comment added successfully",
      data: comment,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return sendResponse({
      success: false,
      message: "Failed to create comment",
      status: 500,
    });
  }
}
