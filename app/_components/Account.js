"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";

function Account() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  if (!session?.user) return null;

  const profileHref = `/${session.user.role}/profile`;
  const dashboardHref = `/${session.user.role}`;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ redirect: false, callbackUrl: "/" });
      setOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Unable to log out:", error);
      setSigningOut(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 border-l-2 border-accent-rust pl-3 text-primary"
      >
        <span className="rounded-full bg-accent-pink overflow-hidden w-8 h-8 flex items-center justify-center">
          {session.user.image ? (
            <Image
              src={session.user.image}
              height={32}
              width={32}
              alt={`${session.user.name}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4" />
          )}
        </span>
        <span className="hidden md:block text-lg font-bold max-w-36 truncate">
          {session.user.name}
        </span>
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[2100] mt-3 w-56 overflow-hidden rounded-xl border border-accent-rust bg-white shadow-xl"
        >
          <div className="border-b border-accent-rust/50 px-4 py-3">
            <p className="font-semibold truncate">{session.user.name}</p>
            <p className="text-xs text-primary/60 truncate">{session.user.email}</p>
          </div>
          <Link
            role="menuitem"
            href={dashboardHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 hover:bg-accent-light"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            role="menuitem"
            href={profileHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 hover:bg-accent-light"
          >
            <User className="w-4 h-4" /> Profile
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2 border-t border-accent-rust/50 px-4 py-3 text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            {signingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Account;
