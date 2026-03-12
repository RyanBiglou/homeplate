import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const { data: user } = await supabase
    .from("users")
    .select()
    .eq("id", authUser.id)
    .single();

  if (!user || user.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
