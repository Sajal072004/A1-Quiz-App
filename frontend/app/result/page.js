"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Image from "next/image";
import learningData from "../../lib/constants/learningType.json";

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ResultContent />
    </Suspense>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "Visual";
  const userId = searchParams.get("userId");

  const [user, setUser] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!userId) return;

    

    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUser(userData); // Store user info
        localStorage.setItem("userEmail", userData.email); // Store email for later use

        // Send email only if not already sent
        if (!emailSent) {
          await sendEmail(userData);
          setEmailSent(true);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    const sendEmail = async (userData) => {
      try {
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            type: type, // Use type from searchParams
          }),
        });

        if (!emailResponse.ok) throw new Error("Failed to send email");

        console.log("Email sent successfully!");
      } catch (error) {
        console.error("Failed to send email:", error);
      }
    };

    fetchUserInfo();
  }, [userId, emailSent, type]);

  const result = learningData[type] || learningData["Visual"];

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-8 py-12 bg-gradient-to-br from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* 📩 Email Notification Message */}
      <motion.div
        className="flex items-center space-x-3 px-5 py-3 bg-blue-500 text-white rounded-lg shadow-lg dark:bg-indigo-600 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        <Mail className="w-6 h-6 animate-bounce" />
        <span className="text-lg font-semibold">
          Your report has been sent to your email!
        </span>
      </motion.div>

      {/* 🎉 Animated Card */}
      <motion.div
        className="w-full max-w-4xl"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl border border-gray-300 dark:border-gray-800 relative overflow-hidden text-center">
          <CardHeader className="text-center py-0">
            <CardTitle className="text-4xl font-extrabold text-gray-800 dark:text-white">
              🎉 Congratulations, {user ? user.name : "Student"}! 🎉
              <div className="ml-2 text-4xl bg-red-600 dark:text-red-500 text-transparent bg-clip-text mt-6 font-extrabold">
                {result.title}!!
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center pb-4">
            {/* 🏅 Badge Image */}
            <motion.div className="relative">
              <Image
                src={result.badgeUrl}
                alt="Badge"
                width={180}
                height={180}
                className="w-44 h-44 rounded-full shadow-lg border-4 border-gray-300 dark:border-gray-700"
              />
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-500 rounded-full animate-ping"></div>
            </motion.div>

            {/* 🏆 Learning Type */}
            <h1 className="mt-4">
              <span className="text-4xl font-extrabold text-gray-800 dark:text-white">
                You are a&nbsp;
              </span>
              <motion.span className="ml-2 text-4xl bg-gradient-to-r from-blue-500 to-purple-500 text-transparent dark:text-transparent bg-clip-text mt-6 font-extrabold">
                {type} Learner
              </motion.span>
            </h1>

            {/* 🔍 Specialty */}
            <motion.p className="mt-4 text-lg text-gray-700 dark:text-gray-300 text-center max-w-2xl leading-relaxed">
              {result.speciality}
            </motion.p>

            {/* 📌 Suggestions Section */}
            <motion.div className="mt-8 w-full max-w-3xl text-left">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mb-4 text-left">
                How to Improve:
              </h3>
              <ul className="list-disc space-y-4 pl-6 text-gray-800 dark:text-gray-300 text-lg">
                {result.suggestions.map((suggestion) => (
                  <motion.li key={suggestion}>{suggestion}</motion.li>
                ))}
              </ul>
            </motion.div>

            {/* 🔄 Restart Quiz Button */}
            <Button
              className="mt-10 px-7 py-6 text-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:opacity-90 transition-all duration-300"
              onClick={() => router.push("/")}
            >
              Take the Quiz Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ✅ Loading Component for Suspense
function LoadingComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">
      Loading results...
    </div>
  );
}
