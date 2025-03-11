"use client";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center py-4 px-6 shadow-md bg-white dark:bg-gray-700">
      {/* Clicking this redirects to Home */}
      <Link href="/" className="text-2xl font-bold text-primary dark:text-white hover:opacity-80 transition">
        A1 Academy
      </Link>
      <Button onClick={toggleTheme} variant="outline">
        {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </Button>
    </nav>
  );
}
