import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import path from "path";
import { writeFile } from "fs/promises";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let posts;
    if (userId) {
      // Fetch posts for a specific user
      posts = await prisma.post.findMany({
        where: { authorId: parseInt(userId) },
        include: {
          author: { select: { id: true, name: true, email: true } },
          likes: true,
          comments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Fetch all posts (Admin use case)
      posts = await prisma.post.findMany({
        include: {
          author: { select: { id: true, name: true, email: true } },
          likes: true,
          comments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

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
    const formData = await request.formData();
    const text = formData.get("text");
    const authorId = parseInt(formData.get("authorId"), 10);
    const file = formData.get("image");

    let imageUrl = null;

    // If image is uploaded
    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const filePath = path.join(process.cwd(), "public/uploads", filename);

      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    // Validation: at least text or image required
    if (!text && !imageUrl) {
      return NextResponse.json(
        { success: false, message: "Text or image is required" },
        { status: 400 }
      );
    }

    // Save to database
    const post = await prisma.post.create({
      data: {
        text: text || null,
        imageUrl,
        authorId,
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
