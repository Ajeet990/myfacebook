import prisma from "@/app/lib/prisma";
import { sendResponse } from "@/app/lib/apiResponses";

export async function GET() {
  try {
    // Fetch all posts from all users, newest first
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          select: { id: true }, // just ids, enough for .length
        },
        comments: {
          select: { id: true }, // just ids, enough for .length
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Posts fetched successfully",
      data: { posts },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return sendResponse(500, { error: "Failed to fetch posts" });
  }
}
