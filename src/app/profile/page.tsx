"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">User Profile</h1>
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-card border border-border shadow-sm",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
