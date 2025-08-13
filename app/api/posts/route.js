import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import path from "path";
import { writeFile } from "fs/promises";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET; // Must match NextAuth

// ✅ Verify and decode JWT from Authorization header
function verifyAuth(request) {
  const authHeader = request.headers.get("authorization");
  // console.log("bb", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7).trim(); // Remove "Bearer "

  try {
    const decoded = jwt.verify(token, secret); // Verify & decode
    // Check that required fields exist
    if (decoded && decoded.id && decoded.name && decoded.email) {
      return decoded;
    }
    return null;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

export async function GET(request) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("decoded user: ", user)

    // const { searchParams } = new URL(request.url);
    // const userId = searchParams.get("userId");
    const userId = user?.id

    let posts;
    if (userId) {
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
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const text = formData.get("text");
    const authorId = parseInt(formData.get("authorId"), 10);
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
