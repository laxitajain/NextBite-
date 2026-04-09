import "@/app/_styles/globals.css";
import Header from "./_components/Header";

import { Noto_Sans_Avestan } from "next/font/google";
import { Anton } from "next/font/google";
import Footer from "./_components/Footer";
import { AuthProvider } from "./providers";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

const noto = Noto_Sans_Avestan({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-noto",
});

export const metadata = {
  title: {
    template: "%s | Nextbite",
    default: "Nextbite",
  },
  description: "Eliminating Food Waste",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${noto.variable} ${anton.variable} font-noto bg-gradient-to-t from-[#F7EAC8] to-[#F4EDDD] min-h-screen flex flex-col antialiased relative text-primary`}
      >
        <AuthProvider>
          <Header />

          <div className="flex-1 mt-14 px-2 pt-20 py-6 grid mb-4">
            <main className="max-w-7xl px-14  mx-auto w-full">{children}</main>
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
