import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text, password, operation } = body;

    if (!text || !password || !operation) {
      return NextResponse.json(
        { error: "Missing required fields: text, password, operation" },
        { status: 400 }
      );
    }

    // Here you would call your Python backend
    // For now, this is a placeholder that forwards to your existing backend
    const backendResponse = await fetch("http://localhost:5000/cipher", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, password, operation }),
    });

    if (!backendResponse.ok) {
      throw new Error("Backend service error");
    }

    const result = await backendResponse.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cipher API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
