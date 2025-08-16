// /app/api/auth/register/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/app/lib/prisma";
import { success } from "zod";
import { sendResponse } from "@/app/lib/apiResponses";
// import Next

export async function POST(req) {
  try {
    const { name, email, phone, password } = await req.json();

    // check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });
    return sendResponse({
      success: true,
      message: "User registered successfully",
      status: 201,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
