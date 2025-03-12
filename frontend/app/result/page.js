"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Download, Share2 } from "lucide-react";
import Image from "next/image";
import learningData from "../../lib/constants/learningType.json";
import { WhatsappShareButton, TwitterShareButton } from "react-share";

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ResultContent />
    </Suspense>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "Visual";
  const userId = searchParams.get("userId");

  const [user, setUser] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(""); // For downloading
  const [shareUrl, setShareUrl] = useState(""); // For sharing
  const [emailSent, setEmailSent] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("userEmail", userData.email);

        // Fetch the certificate PDF URL from the API
        const pdfResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email?name=${encodeURIComponent(
            userData.name
          )}&type=${encodeURIComponent(type)}`
        );

        if (!pdfResponse.ok) throw new Error("Failed to fetch certificate");

        const { pdfUrl } = await pdfResponse.json();

        // ✅ Use Cloudinary URL for sharing
        setShareUrl(pdfUrl);

        // ✅ Convert to a blob URL for downloading
        setPdfUrl(await fetchPdfBlob(pdfUrl));
        setLoadingPdf(false);

        if (!emailSent) {
          await sendEmail(userData);
          setEmailSent(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchPdfBlob = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch PDF");
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error loading PDF:", error);
        return "";
      }
    };

    const sendEmail = async (userData) => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            type: type,
          }),
        });
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
      {/* 📩 Email Notification */}
      <motion.div
        className="flex items-center space-x-3 px-5 py-3 bg-blue-500 text-white rounded-lg shadow-lg dark:bg-indigo-600 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Mail className="w-6 h-6 animate-bounce" />
        <span className="text-lg font-semibold">Your report has been sent to your email!</span>
      </motion.div>

      {/* 🎉 Certificate Card */}
      <motion.div
        className="w-full max-w-4xl"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl border border-gray-300 dark:border-gray-800 text-center">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold text-gray-800 dark:text-white">
              🎉 Congratulations, {user ? user.name : "Student"}! 🎉
              <div className="ml-2 text-4xl bg-red-600 dark:text-red-500 text-transparent bg-clip-text mt-6 font-extrabold">
                {result.title}!!
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center pb-4">
            {/* 🏅 Badge */}
            <motion.div className="relative">
              <Image
                src={result.badgeUrl}
                alt="Badge"
                width={180}
                height={180}
                className="w-44 h-44 rounded-full shadow-lg border-4 border-gray-300 dark:border-gray-700"
              />
            </motion.div>

            {/* 🏆 Learning Type */}
            <h1 className="mt-4 text-4xl font-extrabold text-gray-800 dark:text-white">
              You are a <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">{type} Learner</span>
            </h1>

            <motion.p className="mt-4 text-lg text-gray-700 dark:text-gray-300 text-center max-w-2xl leading-relaxed">
              {result.speciality}
            </motion.p>

            {/* 📜 Download & Share */}
            <div className="flex flex-wrap gap-4 mt-8">
              {/* 🏆 Download Certificate */}
              <Button
                className="px-6 py-3 text-lg font-medium bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-all flex items-center"
                onClick={() => window.open(pdfUrl, "_blank")}
                disabled={!pdfUrl || loadingPdf}
              >
                <Download className="w-5 h-5 mr-2" />
                {loadingPdf ? "Loading..." : "Download Certificate"}
              </Button>

              {/* 📤 Share Buttons */}
              <WhatsappShareButton url={shareUrl} title="Check out my learning certificate!">
                <Button className="px-6 py-3 bg-green-500 text-white rounded-lg flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </WhatsappShareButton>

              <TwitterShareButton url={shareUrl} title="I just got my learning certificate! 🎓">
                <Button className="px-6 py-3 bg-blue-400 text-white rounded-lg flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Twitter
                </Button>
              </TwitterShareButton>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ✅ Loading Component
function LoadingComponent() {
  return <div className="flex items-center justify-center min-h-screen">Loading results...</div>;
}
