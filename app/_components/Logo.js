import Image from "next/image";
import Link from "next/link";

function Logo({ location }) {
  return (
    <Link href="/" className="m-0 flex items-center">
      <span>
        <Image
          width={45}
          height={45}
          src={location === "header" ? "/final.png" : "/final-footer-f.png"}
          alt="Logo"
          quality={100}
        />
      </span>
      <span className="text-4xl pl-2 font-anton">NEXTBITE</span>
    </Link>
  );
}

export default Logo;
