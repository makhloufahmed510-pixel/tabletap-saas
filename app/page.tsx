import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <div className="min-h-dvh bg-ink text-cream flex flex-col">
      <header className="mx-auto w-full max-w-2xl px-5 sm:px-8 pt-6">
        <Logo tone="light" />
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-5 sm:px-8 flex flex-col justify-center py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-brass-light">
          For restaurants
        </p>
        <h1 className="mt-4 font-display italic text-4xl sm:text-6xl leading-[1.05]">
          A booking page your customers can fill in one hand.
        </h1>
        <p className="mt-6 max-w-md text-cream/70 leading-relaxed">
          TableTap gives your restaurant a simple reservation page and a
          dashboard to confirm, reject, or cancel requests — with a WhatsApp
          message ready to send the moment a table&apos;s decided.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/r/le-petit-port">
            <Button variant="secondary">View demo restaurant</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="border-cream/25 text-cream hover:border-cream/60">
              Owner login
            </Button>
          </Link>
        </div>

        <dl className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-cream/15 pt-8">
          <div>
            <dt className="font-display italic text-lg">Book in seconds</dt>
            <dd className="mt-1 text-sm text-cream/60">
              No account needed — name, phone, date, done.
            </dd>
          </div>
          <div>
            <dt className="font-display italic text-lg">Decide from anywhere</dt>
            <dd className="mt-1 text-sm text-cream/60">
              Confirm, reject, or cancel from any phone.
            </dd>
          </div>
          <div>
            <dt className="font-display italic text-lg">WhatsApp-native</dt>
            <dd className="mt-1 text-sm text-cream/60">
              Every decision comes with a message ready to send.
            </dd>
          </div>
        </dl>
      </main>

      <footer className="mx-auto w-full max-w-2xl px-5 sm:px-8 pb-8 text-xs text-cream/40">
        TableTap MVP
      </footer>
    </div>
  );
}
