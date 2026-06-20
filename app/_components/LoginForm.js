"use client";

import Link from "next/link";
import { benefits } from "../_lib/constants";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { HeartHandshake, TrendingUp, Leaf } from "lucide-react";

const iconMap = {
  HeartHandshake: HeartHandshake,
  TrendingUp: TrendingUp,
  Leaf: Leaf,
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid Credentials");
        return;
      }

      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="bg-accent-mango rounded-lg p-6 shadow-md">
        <ul className="space-y-2 mb-6 text-base ">
        {benefits.map((benefit) => {
          const IconComponent = iconMap[benefit.icon] || HeartHandshake;
          return (
            <li key={benefit.description}>
              <span className="flex items-center font-semibold gap-x-3 text-primary">
                <IconComponent className="w-5 h-5 text-secondary shrink-0" />
                {benefit.description}
              </span>
            </li>
          );
        })}
        </ul>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
          />

          <Button type="submit">
            Log In
          </Button>
          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
          <Link className="text-sm mt-3 text-right" href={"/join"}>
            Don&apos;t have an account?{" "}
            <span className="underline">Register</span>
          </Link>
        </form>
      </div>
    </>
  );
}
