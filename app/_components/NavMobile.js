"use client";

import { useState } from "react";
import { Squash as Hamburger } from "hamburger-react";
import { navLinks } from "../_lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "./Button";

function NavMobile() {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

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
                  onClick={() => setOpen(false)}
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
              <li className="h-10 px-0.5 py-2 font-semibold transition-colors cursor-pointer hidden sm:block">
                <Link href="/join">Join us</Link>
              </li>
              <li>
                <Button>
                  {" "}
                  <Link href="/login">Log in</Link>
                </Button>
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
