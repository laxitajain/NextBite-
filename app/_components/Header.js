"use client";

import Navigation from "@/app/_components/Navigation";
import Logo from "@/app/_components/Logo";
import Account from "./Account";
import NotificationCenter from "./NotificationCenter";
import { useSession } from "next-auth/react";

function Header() {
  const { data: session } = useSession();
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-8  bg-[#F4EDDD]/95">
      <div className="flex justify-between items-center max-w-7xl mt-3 pb-3 mx-auto border-b-2  border-accent-rust">
        <Logo location="header" />

        <Navigation />
        <div className="flex items-center gap-4">
          {session && <NotificationCenter user={session.user} />}
          {session && <Account />}
        </div>
      </div>
    </header>
  );
}

export default Header;
