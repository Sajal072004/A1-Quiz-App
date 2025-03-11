"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center h-screen text-center bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-gray-900 dark:via-gray-800 dark:to-black w-screen overflow-hidden">
      
      {/* Animated Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl sm:text-5xl md:text-6xl font-extrabold text-white dark:text-gray-200 drop-shadow-lg px-4"
      >
        Discover Your Learning Style!
      </motion.h1>

      {/* Animated Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="text-base sm:text-lg md:text-xl mt-4 mb-6 max-w-3xl text-white/90 dark:text-gray-300 px-4"
      >
        Take the quiz to find out whether you&apos;re a{" "}
        <span className="font-semibold">Visual</span>,{" "}
        <span className="font-semibold">Auditory</span>,{" "}
        <span className="font-semibold">Reading/Writing</span>, or{" "}
        <span className="font-semibold">Kinesthetic</span> learner.
      </motion.p>

      {/* Animated Button with Improved Contrast */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        className=" z-50"
      >
        <Button
          className="px-8 py-8 rounded-lg text-lg font-semibold transition-all shadow-lg bg-blue-600 text-white dark:bg-purple-600 dark:text-white hover:bg-blue-700 dark:hover:bg-purple-700 hover:shadow-xl dark:hover:shadow-purple-500/50 hover:scale-105 active:scale-95 z-50"
          onClick={() => router.push("/quiz")}
        >
          Start Quiz
        </Button>
      </motion.div>

      {/* Decorative Floating Blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ delay: 1, duration: 2, ease: "easeOut" }}
        className="absolute w-[350px] h-[350px] bg-purple-400 opacity-30 blur-[100px] rounded-full top-[-10%] left-[-10%] dark:bg-purple-900"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ delay: 1.2, duration: 2, ease: "easeOut" }}
        className="absolute w-[250px] h-[250px] bg-blue-400 opacity-30 blur-[100px] rounded-full bottom-[-10%] right-[-10%] dark:bg-blue-900"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ delay: 1.5, duration: 2, ease: "easeOut" }}
        className="absolute w-[300px] h-[300px] bg-pink-400 opacity-30 blur-[100px] rounded-full bottom-20 left-10 dark:bg-pink-900"
      />
    </div>
  );
}
