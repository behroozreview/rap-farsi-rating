import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth";

export async function requireAdminPage() {
  const session = await auth();

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect("/api/auth/signin");
  }

  return session;
}

export async function requireAdminApi() {
  const session = await auth();

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }

  return session;
}
