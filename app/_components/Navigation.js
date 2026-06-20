"use client";

import Link from "next/link";
import { navLinks } from "@/app/_lib/constants";
import NavMobile from "./NavMobile";
import Button from "./Button";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleLinkClick = (e, href) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="z-10 text-[1.2rem]">
      <ul className="flex gap-16 items-center">
        {navLinks.map((link) => (
          <li
            className="h-10 px-0.5 py-2 font-bold transition-colors cursor-pointer hidden sm:block"
            key={link.to}
          >
            <Link href={link.to} onClick={(e) => handleLinkClick(e, link.to)}>
              {link.label}
            </Link>
          </li>
        ))}
        {status === "unauthenticated" && (
          <>
            <li className="h-10 px-0.5 py-2 font-bold transition-colors cursor-pointer hidden sm:block">
              <Link href="/join" onClick={(e) => handleLinkClick(e, "/join")}>
                Join us
              </Link>
            </li>
            <li className="hidden sm:block">
              <Link href="/login" onClick={(e) => handleLinkClick(e, "/login")}>
                <Button>Log in</Button>
              </Link>
            </li>
          </>
        )}
        {session?.user.role === "donor" && (
          <>
            <li className="h-10 px-0.5 py-2 font-semibold transition-colors cursor-pointer hidden sm:block">
              <Link href="/donor" onClick={(e) => handleLinkClick(e, "/donor")}>
                Create Listing
              </Link>
            </li>
          </>
        )}
        {session?.user.role === "recipient" && (
          <>
            <li className="h-10 px-0.5 py-2 font-semibold transition-colors cursor-pointer hidden sm:block">
              <Link href="/recipient" onClick={(e) => handleLinkClick(e, "/recipient")}>
                Find Food
              </Link>
            </li>
          </>
        )}

        <li className="sm:hidden">
          <NavMobile></NavMobile>
        </li>
      </ul>
    </nav>
  );
}
