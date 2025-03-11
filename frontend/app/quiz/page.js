"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import axios from "axios";

// Option Mapping for Learning Styles
const optionMapping = {
  0: "Visual",
  1: "Auditory",
  2: "Reading/Writing",
  3: "Kinesthetic",
};

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    class: "",
    email: "",
    phone: "",
  });
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader State
  const [friendInfo, setFriendInfo] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/quiz");
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleStartQuiz = () => {
    if (
      (!studentInfo.name || !studentInfo.class || !studentInfo.email,
      !studentInfo.phone)
    ) {
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
    if (isSubmitting) return; // Prevent multiple clicks

    try {
      if (Object.keys(answers).length !== questions.length) {
        alert("Please answer all questions before submitting.");
        return;
      }

      if (!friendInfo.name || !friendInfo.phone) {
        alert("Please enter your friend's details before submitting.");
        return;
      }

      setIsSubmitting(true); // Activate Loader

      const userRes = await axios.post(
        "http://localhost:5000/api/users",
        studentInfo
      );
      const userId = userRes.data.id;

      const formattedAnswers = Object.entries(answers).map(
        ([_, index]) => optionMapping[index]
      );

      await axios.post("http://localhost:5000/api/referrals", friendInfo);

      const resultRes = await axios.post(
        "http://localhost:5000/api/results",
        { userId, answers: formattedAnswers },
        { headers: { "Content-Type": "application/json" } }
      );
      setFriendInfo({ name: "", phone: "" });
      router.push(`/result?type=${resultRes.data.type}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Try again!");
    } finally {
      setIsSubmitting(false); // Deactivate Loader
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-screen p-6 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-gray-900 dark:via-gray-800 dark:to-black text-white overflow-hidden">
      {step === 1 ? (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md text-center mt-48"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Enter Your Details
          </h2>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={studentInfo.name}
              onChange={(e) =>
                setStudentInfo({ ...studentInfo, name: e.target.value })
              }
              className="text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            />
            <Input
              type="text"
              placeholder="Class"
              value={studentInfo.class}
              onChange={(e) =>
                setStudentInfo({ ...studentInfo, class: e.target.value })
              }
              className="text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            />
            <Input
              type="email"
              placeholder="Email"
              value={studentInfo.email}
              onChange={(e) =>
                setStudentInfo({ ...studentInfo, email: e.target.value })
              }
              className="text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            />
            <Input
              type="text"
              placeholder="Phone Number"
              value={studentInfo.phone}
              onChange={(e) =>
                setStudentInfo({ ...studentInfo, phone: e.target.value })
              }
              className="text-gray-900 dark:text-gray-100 dark:bg-gray-800"
            />
            <Button
              onClick={handleStartQuiz}
              className="w-full mt-4 bg-blue-600 dark:bg-blue-700 hover:scale-105 transition-all dark:text-white"
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
            className="text-3xl sm:text-4xl font-extrabold mb-10 text-center text-gray-900 dark:text-gray-100"
          >
            Take the Quiz
          </motion.h2>

          <div className="w-full flex flex-col items-center px-6">
            {questions.map((q, index) => (
              <motion.div
                key={q.id}
                className="mb-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full sm:w-4/5 md:w-3/4 lg:w-3/4 xl:w-2/3 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Question */}
                <p className="font-semibold text-2xl sm:text-2xl md:text-2xl text-gray-900 dark:text-gray-100 leading-relaxed">
                  {index + 1}. {q.text}
                </p>

                {/* Options Container */}
                <div className="mt-6 flex flex-col gap-4 w-full">
                  {q.options.map((option, idx) => (
                    <motion.div
                      key={option.id}
                      whileTap={{ scale: 0.97 }}
                      className="w-full min-h-[50px] sm:min-h-[auto] flex items-center"
                    >
                      <Button
                        variant={answers[q.id] === idx ? "default" : "outline"}
                        onClick={() => handleOptionSelect(q.id, idx)}
                        className={`w-full h-full py-4 px-6 text-md text-left rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm
          hover:bg-blue-500 hover:text-gray-200 dark:hover:bg-blue-500 transition-all break-words whitespace-normal
          ${
            answers[q.id] === idx
              ? "bg-blue-500 text-white dark:bg-blue-600"
              : "bg-gray-100 text-gray-900 dark:bg-gray-500 dark:text-white"
          }`}
                      >
                        {option.text}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Refer a Friend Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg mt-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Do you think any of your friends would benefit from this? Enter
              their details:
            </h3>
            <Input
              type="text"
              className="text-black dark:text-white"
              placeholder="Friend's Name"
              value={friendInfo.name}
              onChange={(e) =>
                setFriendInfo({ ...friendInfo, name: e.target.value })
              }
            />
            <Input
              type="tel"
              className="text-black dark:text-white mt-3"
              placeholder="Friend's Phone Number"
              value={friendInfo.phone}
              onChange={(e) =>
                setFriendInfo({ ...friendInfo, phone: e.target.value })
              }
            />
          </motion.div>

          {/* Submit Button with Loader */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4"
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting} // Disable button while submitting
              className={`px-16 py-8 text-xl font-semibold transition-all shadow-md rounded-lg ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Generating your report..." : "Submit"}
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}
