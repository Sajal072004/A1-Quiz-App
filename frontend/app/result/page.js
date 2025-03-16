"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Download, Share2} from "lucide-react";
import Image from "next/image";
import learningData from "../../lib/constants/learningType.json";
import { WhatsappShareButton } from "react-share";

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ResultContent />
    </Suspense>
  );
}

const handleCopyToClipboard = (shareUrl) => {
  const shareText = `I just got my learning certificate! 🎓  
Check it out here: ${shareUrl}  
#Learning #Certificate @a1academy_jbp`;

  navigator.clipboard.writeText(shareText).then(() => {
    alert("Text copied! Paste it on Instagram and tag @a1academy_jbp 🎉");
  });
};

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
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL
          }/api/email?name=${encodeURIComponent(
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
      className="flex flex-col items-center justify-center min-h-screen px-8 py-12 bg-gradient-to-br from-blue-200 to-blue-100 dark:from-gray-900 dark:to-gray-800 mt-12"
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
        <span className="text-lg font-semibold">
          Your report has been sent to your email!
        </span>
      </motion.div>

      {/* 🎉 Certificate Card */}
      <motion.div
        className="w-full max-w-4xl"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="bg-gray-100 dark:bg-gray-800 shadow-2xl rounded-3xl border border-gray-300 dark:border-gray-800 text-center">
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
              You are a{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                {type} Learner
              </span>
            </h1>

            <motion.p className="mt-4 text-lg text-gray-700 dark:text-gray-300 text-left max-w-2xl leading-relaxed">
              {result.speciality}
            </motion.p>

            {/* Suggestions Section */}
            <h2 className="mt-12 mb-4 text-4xl font-semibold text-gray-800 dark:text-white">
              Suggested Learning Strategies
            </h2>

            <ul className="mt-3 text-lg text-gray-700 dark:text-gray-300 text-left max-w-2xl list-disc list-inside">
              {result.suggestions.map((suggestion, index) => (
                <li key={suggestion} className="mt-2">
                  {suggestion}
                </li>
              ))}
            </ul>

            {/* 📜 Download & Share */}
<div className="mt-12 flex flex-col items-center space-y-6">
  {/* 📤 Share Actions */}
  <div className="flex flex-wrap justify-center gap-6">
    
    {/* 🏆 Download Certificate */}
    <Button
      className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center"
      onClick={() => window.open(pdfUrl, "_blank")}
      disabled={!pdfUrl || loadingPdf}
    >
      <Download className="w-6 h-6 mr-2" />
      {loadingPdf ? "Generating..." : "Download Certificate"}
    </Button>

    {/* 📲 WhatsApp Share */}
    <WhatsappShareButton
      url={shareUrl}
      title="🎓 I just earned my Learning Certificate! 🚀 #Learning #Education #A1Academy"
    >
      <Button className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-green-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-green-600 transition-all">
        <Share2 className="w-6 h-6 mr-2" />
        Share on WhatsApp
      </Button>
    </WhatsappShareButton>
  </div>

  {/* 🎉 Instagram Share Notice */}
  <div className="w-full sm:w-auto bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-200 dark:to-pink-300 text-pink-800 p-6 rounded-xl shadow-md flex flex-col items-center justify-center border border-pink-300 max-w-lg text-center">
    <p className="text-lg font-semibold">
      🎉 Share your certificate on Instagram and tag <span className="font-bold">@a1academy_jbp</span>.  
      We will feature it in our story and tag you back! 🚀
    </p>
  </div>
</div>

          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ✅ Loading Component
function LoadingComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      Loading results...
    </div>
  );
}
