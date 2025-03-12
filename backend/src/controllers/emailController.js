import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (req, res) => {
  try {
    const { name, email, type } = req.body;

    if (!name || !email || !type) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    console.log("sending email");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Learning Type Report",
      text: `Hello ${name},\n\nBased on your quiz results, you are a ${type} learner!\n\nHere’s how you can improve:\n\n[Insert recommendations]\n\nBest regards,\nYour Team`,
    };

    await transporter.sendMail(mailOptions);

    console.log("email send successfully");

    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
