import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

type UserData = Pick<Tables<"users">, "id" | "email" | "name" | "role">;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user: UserData | null = null;
  if (authUser) {
    const { data } = await supabase
      .from("users")
      .select()
      .eq("id", authUser.id)
      .single();
    user = data;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
