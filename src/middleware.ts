import { clerkMiddleware } from "@clerk/nextjs/server";

// All routes are public — unauthenticated users see seed/demo data.
// Mutations are gated by UI auth checks and Supabase RLS policies.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
