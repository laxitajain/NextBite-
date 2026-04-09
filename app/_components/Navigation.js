"use client";

import Link from "next/link";
import { navLinks } from "@/app/_lib/constants";
import NavMobile from "./NavMobile";
import Button from "./Button";
import { useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();
  console.log(session);

  return (
    <nav className="z-10 text-[1.2rem]">
      <ul className="flex gap-16 items-center">
        {navLinks.map((link) => (
          <li
            className="h-10 px-0.5 py-2 font-bold transition-colors cursor-pointer hidden sm:block"
            key={link.to}
          >
            <Link href={link.to}>{link.label}</Link>
          </li>
        ))}
        {!session && (
          <>
            <li className="h-10 px-0.5 py-2 font-bold transition-colors cursor-pointer hidden sm:block">
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
        {session?.user.role === "donor" && (
          <>
            <li className="h-10 px-0.5 py-2 font-semibold transition-colors cursor-pointer hidden sm:block">
              <Link href="/donor">Create Listing</Link>
            </li>
            <li className="h-10 px-0.5 py-2 font-semibold transition-colors cursor-pointer hidden sm:block">
              <Link href="/recipient">Browse Food</Link>
            </li>
          </>
        )}
        {session?.user.role === "recipient" && (
          <>
            <li className="h-10 px-0.5 py-2 font-semibold transition-colors cursor-pointer hidden sm:block">
              <Link href="/recipient">Find Food</Link>
            </li>
            <li className="h-10 px-0.5 py-2 font-semibold transition-colors cursor-pointer hidden sm:block">
              <Link href="/donor">Become Donor</Link>
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
