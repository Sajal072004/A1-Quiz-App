"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import axios from "axios";

const dummyQuestions = [
  {
    id: "q1",
    question: "Which environment helps you learn best?",
    options: [
      "Watching videos or diagrams",
      "Listening to explanations",
      "Reading books or articles",
      "Doing hands-on activities",
    ],
  },
  {
    id: "q2",
    question: "How do you prefer to take notes?",
    options: [
      "Drawing mind maps or sketches",
      "Recording audio notes",
      "Writing detailed summaries",
      "Making flashcards or acting it out",
    ],
  },
];

const optionMapping = {
  0: "Visual", // Option A
  1: "Auditory", // Option B
  2: "Reading/Writing", // Option C
  3: "Kinesthetic", // Option D
};

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    class: "",
    email: "",
  });
  const [answers, setAnswers] = useState({});

  const handleStartQuiz = () => {
    if (!studentInfo.name || !studentInfo.class || !studentInfo.email) {
      alert("Please fill in all details!");
      return;
    }
    setStep(2);
  };

  const handleOptionSelect = (questionId, idx) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: idx, // Store index for easier mapping
    }));
  };

  const handleSubmit = async () => {
    try {
      // Ensure all questions are answered
      if (Object.keys(answers).length !== dummyQuestions.length) {
        alert("Please answer all questions before submitting.");
        return;
      }

      // Create user first
      const userRes = await axios.post("http://localhost:5000/api/users", studentInfo);
      const userId = userRes.data.id;

      // Convert answers to learning styles
      const formattedAnswers = Object.entries(answers).map(([_, index]) => optionMapping[index]);

      console.log("Final Answers:", formattedAnswers);
      console.log(userId);

      // Submit results
      
      const resultRes = await axios.post("http://localhost:5000/api/results", 
        {
          userId,
          answers: formattedAnswers,
        },
        {
          headers: {
            "Content-Type": "application/json", // Ensure JSON is sent
          },
        }
      );
      

      console.log("Result:", resultRes.data);
      router.push(`/result?type=${resultRes.data.type}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Try again!");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-screen p-6 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-gray-900 dark:via-gray-800 dark:to-black text-white overflow-hidden">
      {step === 1 ? (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Enter Your Details
          </h2>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={studentInfo.name}
              onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
              className="text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            />
            <Input
              type="text"
              placeholder="Class"
              value={studentInfo.class}
              onChange={(e) => setStudentInfo({ ...studentInfo, class: e.target.value })}
              className="text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            />
            <Input
              type="email"
              placeholder="Email"
              value={studentInfo.email}
              onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })}
              className="text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            />
            <Button
              onClick={handleStartQuiz}
              className="w-full mt-4 bg-blue-600 dark:bg-blue-700 hover:scale-105 transition-all"
            >
              Start Quiz
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl font-extrabold mb-6"
          >
            Take the Quiz
          </motion.h2>
          {dummyQuestions.map((q, index) => (
            <motion.div
              key={q.id}
              className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {index + 1}. {q.question}
              </p>
              <div className="mt-4 space-y-2">
                {q.options.map((option, idx) => (
                  <motion.div key={idx} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={answers[q.id] === idx ? "default" : "outline"}
                      onClick={() => handleOptionSelect(q.id, idx)}
                      className={`w-full transition-all hover:scale-105 ${
                        answers[q.id] === idx
                          ? "bg-blue-500 text-white dark:bg-blue-700"
                          : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                      }`}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              onClick={handleSubmit}
              className="mt-6 px-6 py-3 text-lg font-semibold bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 hover:scale-105 transition-all shadow-lg"
            >
              Submit
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}
