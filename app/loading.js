"use client";
import { useEffect, useState } from "react";

export default function Loading() {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(t);
  }, []);

  if (!show) return <div className="flex flex-1 min-h-[60vh] w-full" />;

  return (
    <div className="flex flex-1 items-center justify-center w-full min-h-[60vh]">
      <div className="w-[10vh] h-[10vh] border-[6px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}
