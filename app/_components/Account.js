import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

function Account() {
  const { data: session } = useSession();
  return (
    <Link href={`/${session.user.role}/profile`}>
      <div className="flex space-x-2 mt-1 items-center border-accent-rust border-l-2 pl-2">
        <span className="rounded-full bg-accent-pink p-1 sm:p-0 overflow-hidden">
          <Image
            src="/pfp.png"
            height={30}
            width={30}
            alt="pfp"
            quality={100}
          ></Image>
        </span>
        <span className="hidden sm:block text-primary text-lg font-bold">
          {" "}
          {session.user.name}
        </span>
      </div>
    </Link>
  );
}

export default Account;
