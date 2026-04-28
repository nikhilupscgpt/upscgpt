import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        tier: true,
        examYear: true,
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("[Profile API] Body:", body);
    
    // 1. Validate incoming data
    const validatedData = profileSchema.parse(body);

    // 2. Identify target user (Must have ID from session)
    const userId = session.user.id;
    if (!userId) {
      console.error("[Profile API] Missing user id in session");
      return NextResponse.json({ error: "Missing identity in session" }, { status: 401 });
    }

    console.log("[Profile API] Updating user:", userId);

    // 3. Perform update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
        examYear: validatedData.examYear,
        preferences: validatedData.preferences || {}
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tier: true,
        examYear: true,
        preferences: true,
      },
    });

    console.log("[Profile API] Update Success:", updatedUser.id);
    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error.name === "ZodError") {
      console.warn("[Profile API] Validation Errors:", error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[Profile API] Uncaught PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
