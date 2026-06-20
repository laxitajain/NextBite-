"use client";

import { useState } from "react";
import { Squash as Hamburger } from "hamburger-react";
import { navLinks } from "../_lib/constants";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "./Button";
import { signOut } from "next-auth/react";
import { Bell, LayoutDashboard, LogOut, User } from "lucide-react";

function NavMobile() {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const handleLinkClick = (e, href) => {
    setOpen(false);
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleSignOut = async () => {
    await signOut({ redirect: false, callbackUrl: "/" });
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="ml-20 relative z-50">
      {/* Hamburger Icon */}
      <Hamburger
        size={22}
        toggled={isOpen}
        toggle={setOpen}
        // disable cross animation
        direction="right"
        rounded
        duration={0.3}
        label="Show menu"
        hideOutline={false}
      />

      {/* Side Drawer Menu */}
      <div
        className={`fixed top-0 right-0 h-full bg-primary text-white shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } w-[85vw] max-w-sm p-6 z-40`}
      >
        {/* Close manually with an X if desired (optional) */}
        <button
          className="absolute top-4 right-5 text-2xl text-accent-rust"
          onClick={() => setOpen(false)}
        >
          &times;
        </button>

        <ul className="mt-10 space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.to;
            return (
              <li key={link.label}>
                <Link
                  href={link.to}
                  onClick={(e) => handleLinkClick(e, link.to)}
                  className={`block w-full px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "" : "hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {!session && (
            <>
              <li>
                <Link
                  href="/join"
                  onClick={(e) => handleLinkClick(e, "/join")}
                  className="block w-full px-4 py-3 rounded-lg hover:bg-white/10"
                >
                  Join us
                </Link>
              </li>
              <li>
                <Link href="/login" onClick={(e) => handleLinkClick(e, "/login")}>
                  <Button className="w-full">Log in</Button>
                </Link>
              </li>
            </>
          )}
          {session && (
            <>
              <li>
                <Link
                  href={`/${session.user.role}`}
                  onClick={(e) => handleLinkClick(e, `/${session.user.role}`)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/10"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href={`/${session.user.role}/profile`}
                  onClick={(e) => handleLinkClick(e, `/${session.user.role}/profile`)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/10"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/notifications"
                  onClick={(e) => handleLinkClick(e, "/notifications")}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/10"
                >
                  <Bell className="w-4 h-4" /> Notifications
                </Link>
              </li>
              <li className="border-t border-white/20 pt-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-3 rounded-lg text-red-200 hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export default NavMobile;
