import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import path from "path";
import { writeFile } from "fs/promises";

// 📌 Helper: Get user from middleware-injected header
function getUserFromRequest(request) {
  const userHeader = request.headers.get("x-user");
  return userHeader ? JSON.parse(userHeader) : null;
}

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const posts = await prisma.post.findMany({
      where: { authorId: parseInt(user.id) },
      include: {
        author: { select: { id: true, name: true, email: true } },
        likes: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const text = formData.get("text");
    const file = formData.get("image");

    let imageUrl = null;
    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const filePath = path.join(process.cwd(), "public/uploads", filename);

      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    if (!text && !imageUrl) {
      return NextResponse.json(
        { success: false, message: "Text or image is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        text: text || null,
        imageUrl,
        authorId: parseInt(user.id),
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create post" },
      { status: 500 }
    );
  }
}
