"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const learningTypes = {
  Visual: {
    badgeUrl: "/badges/visual.png",
    speciality: "You learn best through images, diagrams, and videos.",
    suggestions: [
      "Use mind maps and flowcharts to organize ideas.",
      "Watch video tutorials for a better understanding.",
      "Highlight important texts in different colors.",
      "Use flashcards with images to memorize concepts."
    ]
  },
  Auditory: {
    badgeUrl: "/badges/auditory.png",
    speciality: "You learn best through listening and verbal instructions.",
    suggestions: [
      "Listen to audiobooks and lectures.",
      "Discuss topics with peers or mentors.",
      "Read aloud while studying.",
      "Use rhymes or music to memorize concepts."
    ]
  },
  "Reading/Writing": {
    badgeUrl: "/badges/reading-writing.png",
    speciality: "You learn best through reading and writing down information.",
    suggestions: [
      "Take detailed notes while studying.",
      "Read textbooks and summarize key points.",
      "Write essays or journal entries to reinforce concepts.",
      "Use lists and bullet points to organize information."
    ]
  },
  Kinesthetic: {
    badgeUrl: "/badges/kinesthetic.png",
    speciality: "You learn best through hands-on activities and movement.",
    suggestions: [
      "Engage in practical experiments or demonstrations.",
      "Take frequent breaks to move around.",
      "Use physical objects or models to understand concepts.",
      "Act out or simulate learning topics."
    ]
  }
};

export default function ResultPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "Visual"; // Default to Visual if not found
  const result = learningTypes[type] || learningTypes["Visual"]; // Fallback in case of invalid type

  return (
    <motion.div
      className="flex flex-col items-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary dark:text-white">
            Your Learning Style
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {/* Badge Image */}
          <motion.img
            src={result.badgeUrl}
            alt="Badge"
            className="w-32 h-32 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          />

          {/* Learning Type */}
          <h2 className="text-2xl font-semibold text-primary dark:text-white">
            {type} Learner
          </h2>

          {/* Specialty */}
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 text-center max-w-lg">
            {result.speciality}
          </p>

          {/* Suggestions */}
          <div className="mt-6 w-full">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              How to Improve:
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="mb-2">{suggestion}</li>
              ))}
            </ul>
          </div>

          {/* Restart Quiz Button */}
          <Button className="mt-6" onClick={() => window.location.href = "/"}>
            Take the Quiz Again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
