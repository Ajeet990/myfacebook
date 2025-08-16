import prisma from "@/app/lib/prisma";
import { sendResponse } from "@/app/lib/apiResponses";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: { role: { not: "ADMIN" } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          posts: {
            select: { id: true, text: true, imageUrl: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.user.count({
        where: { role: { not: "ADMIN" } },
      }),
    ]);

    return sendResponse({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        pagination: {
          totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
          currentPage: page,
          perPage: limit,
        },
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return sendResponse({
      success: false,
      message: "Failed to fetch users",
      status: 500,
    });
  }
}
