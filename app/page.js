"use client";
import Image from "next/image";
import Button from "./_components/Button";
import Impact from "./_components/Impact";
import About from "./_components/About";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="mt-0">
      <span className="flex space-x-1 items-center mb-8">
        <Image
          src="/location (1).png"
          height={18}
          width={23}
          quality={100}
          alt="location"
        ></Image>
        <span className="font-semibold">Shirpur</span>
      </span>
      <div className="flex flex-col sm:flex-row space-y-4 border-b-2 pb-10 border-accent-rust">
        <div>
          <h1 className="font-anton uppercase text-6xl mb-4">
            Every bite counts, let none go to waste.
          </h1>
          <div className="text-xl font-semibold mb-4">
            Join a growing community of givers and receivers fighting food waste
            together.
            <p>
              Sign up to donate surplus food or pick up what&apos;s available
              near you.
            </p>
          </div>
          <div className="mt-7">
            {session ? (
              <Link href="/join">
                <Button>Start contributing</Button>
              </Link>
            ) : (
              <Link href="/join">
                <Button>Join the community</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-3xl p-1 bg-accent-mango sm:w-[1000px]">
          <span className="text-5xl font-anton">THE MAP GOES HERE</span>
        </div>
      </div>
      <div className="">
        <section className="pt-24" id="impact">
          <Impact />
        </section>
        <section className="pt-24" id="about">
          <About />
        </section>
      </div>
    </div>
  );
}
