import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-dvh bg-cream">
      <header className="bg-ink text-cream">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Logo tone="light" />
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className="text-sm text-cream/70 hover:text-cream transition-colors"
            >
              Reservations
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm text-cream/70 hover:text-cream transition-colors"
            >
              Settings
            </Link>
            <SignOutButton />
          </nav>
        </div>
        {restaurant && (
          <div className="mx-auto max-w-4xl px-5 sm:px-8 pb-4 flex items-center justify-between">
            <h1 className="font-display italic text-2xl">{restaurant.name}</h1>
            <Link
              href={`/r/${restaurant.slug}`}
              target="_blank"
              className="text-xs text-brass-light hover:text-brass underline underline-offset-4"
            >
              View public page ↗
            </Link>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-4xl px-5 sm:px-8 py-8">{children}</main>
    </div>
  );
}
