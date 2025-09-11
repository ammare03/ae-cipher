import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { encryptText, decryptText } from "@/lib/cipher";

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
    const { 
      text, 
      password, 
      operation, 
      rounds = 3, 
      use_pbr = true, 
      block_size = 8 
    } = body;

    if (!text || !password || !operation) {
      return NextResponse.json(
        { error: "Missing required fields: text, password, operation" },
        { status: 400 }
      );
    }

    if (rounds < 1) {
      return NextResponse.json(
        { error: "Rounds must be at least 1" },
        { status: 400 }
      );
    }

    if (block_size < 1) {
      return NextResponse.json(
        { error: "Block size must be at least 1" },
        { status: 400 }
      );
    }

    let result;

    if (operation === "encrypt") {
      result = encryptText(text, password, rounds, use_pbr, block_size);
      return NextResponse.json({
        success: true,
        result,
        operation: "encrypt",
        settings: {
          rounds,
          use_pbr,
          block_size
        }
      });
    } else if (operation === "decrypt") {
      const { result: decryptedText, error } = decryptText(
        text,
        password,
        rounds,
        use_pbr,
        block_size
      );
      if (error) {
        return NextResponse.json({
          success: false,
          error,
        });
      }
      return NextResponse.json({
        success: true,
        result: decryptedText,
        operation: "decrypt",
        settings: {
          rounds,
          use_pbr,
          block_size
        }
      });
    } else {
      return NextResponse.json(
        { error: "Invalid operation. Must be 'encrypt' or 'decrypt'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Cipher API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
