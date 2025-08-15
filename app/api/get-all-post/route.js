import prisma from "@/app/lib/prisma";
import { sendResponse } from "@/app/lib/apiResponses";

// app/api/get-all-post/route.js
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { 
            id: true, 
            name: true 
          }
        },
        likes: {
          select: { 
            id: true,
            userId: true  // ← This is crucial! Include userId
          }
        },
        comments: {
          include: {
            user: {
              select: { 
                id: true, 
                name: true 
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendResponse({
      success: true,
      message: "Posts fetched successfully",
      data: { posts },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return sendResponse({
      success: false,
      message: "Failed to fetch posts",
      status: 500,
    });
  }
}
