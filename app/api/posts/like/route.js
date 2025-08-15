// app/api/like/route.js
import prisma from "@/app/lib/prisma";
import { sendResponse } from "@/app/lib/apiResponses";
import { z } from "zod";

const LikeSchema = z.object({
  postId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const result = LikeSchema.safeParse(body);

    if (!result.success) {
      return sendResponse({
        success: false,
        message: "Validation failed",
        data: result.error.errors.map(e => e.message),
        status: 400,
      });
    }

    const { postId, userId } = result.data;

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return sendResponse({
        success: true,
        message: "Post unliked successfully",
        data: { liked: false },
        status: 200,
      });
    } else {
      // Like
      const newLike = await prisma.like.create({
        data: { postId, userId },
      });

      return sendResponse({
        success: true,
        message: "Post liked successfully",
        data: { liked: true, like: newLike },
        status: 201,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return sendResponse({
      success: false,
      message: "Failed to toggle like",
      status: 500,
    });
  }
}
