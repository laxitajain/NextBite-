"use client";
import Button from "./_components/Button";
import Impact from "./_components/Impact";
import About from "./_components/About";
import FoodMap from "./_components/FoodMap";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MapPin } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="mt-0">
      <span className="flex space-x-1 items-center mb-8">
        <MapPin className="w-5 h-5 text-secondary" />
        <span className="font-semibold">Shirpur</span>
      </span>
      <div className="flex flex-col sm:flex-row space-y-4 border-b-2 pb-10 border-accent-rust gap-6">
        <div className="sm:flex-1">
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

        <div className="rounded-2xl overflow-hidden shadow-lg sm:w-[500px] h-[350px]">
          <FoodMap
            listings={[]}
            userLocation={{ lat: 21.3462, lng: 74.8814 }}
          />
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
