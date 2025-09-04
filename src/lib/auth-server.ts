import { auth } from "@clerk/nextjs/server";

export async function getAuthUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return { userId };
}

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  return { userId };
}
