"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, LogIn, Backpack, LucideLogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';

export default function Header() {

  const [toggleLogin, setToggelLogin] = useState(false);

  async function logOut() {
    await Cookies.remove('tok_UID');
    window.location.href = '/'
  }

  useEffect(() => {
    const tok = Cookies.get('tok_UID');

    if (tok) {
      setToggelLogin(true);
    }
  })

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto my-4 max-w-8xl px-4">
        <div className="flex items-center justify-between rounded-full bg-white backdrop-blur-md px-6 py-4 shadow-md transition-all">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Vistro.Shop
            </h2>
          </div>

          <ul className="hidden md:flex items-center justify-center space-x-8 text-gray-800">
            {["Home", "Browse", "Support"].map((item) => (
              <li key={item} className="relative group cursor-pointer">
                <Link href={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`} className="text-xl font-medium hover:text-gray-600 transition-colors">
                  <span className="relative z-10">{item}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Button asChild className="rounded-md bg-transparent border border-gray-200 hover:bg-gray-100 text-lg font-medium text-gray-700 px-4 py-2">
              <Link href="/cart"><ShoppingBasket /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-md bg-transparent border border-gray-200 hover:bg-gray-100 text-lg font-medium text-gray-700 px-4 py-2">
              <Link href="/purchased"><Backpack /></Link>
            </Button>
            {
              !toggleLogin ? <>
                <Button asChild variant="outline" className="rounded-md bg-black border border-gray-200 hover:bg-gray-700 text-lg font-medium px-4 py-2">
                  <Link href="/auth/login"><User className="text-white" /></Link>
                </Button></> : <Button asChild variant="outline" onClick={logOut} className="rounded-md bg-black border border-gray-200 hover:bg-black-100 text-lg font-medium text-black-700 px-4 py-2 cursor-pointer">
                <a>
                  <LucideLogOut className="text-white" />
                </a>
              </Button>
            }
          </div>
        </div>
      </nav>
    </header>
  );
}