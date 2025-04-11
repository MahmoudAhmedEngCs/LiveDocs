import Link from "next/link";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Header = ({ children, className }: HeaderProps) => {
  return (
    <div className={cn("header", className)}>
      <div className="md:flex-1 flex items-center gap-2">
        
        <Link href="/" className=" hidden md:block">
          <Image
            src="/assets/icons/logo.svg"
            alt="Logo with name"
            width={120}
            height={32}
          />
        </Link>

        {/* الصورة الصغيرة تظهر فقط عندما يكون الحجم أقل من md */}
        <Link href="/" className="inline-block md:hidden">
          <Image
            src="/assets/icons/logo-icon.svg"
            alt="Logo"
            width={32}
            height={32}
          />
        </Link>
      </div>
      {children}
    </div>
  );
};

export default Header;
