import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";

function Account() {
  const { data: session } = useSession();
  return (
    <Link href={`/${session.user.role}/profile`}>
      <div className="flex space-x-2 mt-1 items-center border-accent-rust border-l-2 pl-2">
        <span className="rounded-full bg-accent-pink overflow-hidden w-8 h-8 flex items-center justify-center">
          {session.user.image ? (
            <Image
              src={session.user.image}
              height={32}
              width={32}
              alt="pfp"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </span>
        <span className="hidden sm:block text-primary text-lg font-bold">
          {session.user.name}
        </span>
      </div>
    </Link>
  );
}

export default Account;
