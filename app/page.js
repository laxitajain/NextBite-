"use client";
import Button from "./_components/Button";
import Impact from "./_components/Impact";
import About from "./_components/About";
import FoodMap from "./_components/FoodMap";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { MapPin, MapPinOff, Loader2 } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [locationName, setLocationName] = useState(null);
  const [locationStatus, setLocationStatus] = useState("pending"); // pending | granted | denied
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ lat: latitude, lng: longitude });
        setLocationStatus("granted");
        // Reverse geocode for display name
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=12`
        )
          .then((r) => r.json())
          .then((data) => {
            const name =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              "Your area";
            setLocationName(name);
          })
          .catch(() => setLocationName("Your area"));
      },
      () => {
        setLocationStatus("denied");
      }
    );
  }, []);

  return (
    <div className="mt-0">
      {/* Location indicator */}
      <span className="flex space-x-1 items-center mb-8">
        {locationStatus === "pending" && (
          <>
            <Loader2 className="w-5 h-5 text-secondary animate-spin" />
            <span className="font-semibold text-primary/60">Locating…</span>
          </>
        )}
        {locationStatus === "granted" && (
          <>
            <MapPin className="w-5 h-5 text-secondary" />
            <span className="font-semibold">{locationName || "Your area"}</span>
          </>
        )}
        {locationStatus === "denied" && (
          <>
            <MapPinOff className="w-5 h-5 text-primary/40" />
            <span className="font-semibold text-primary/60">
              Location unavailable
            </span>
          </>
        )}
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
              <Link href={`/${session.user?.role || "donor"}`}>
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
            userLocation={mapCenter}
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
