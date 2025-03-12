import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

// Fix for JSON import issue in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const learningData = JSON.parse(
  readFileSync(path.join(__dirname, "../libs/learningType.json"), "utf-8")
);

dotenv.config();

export const sendEmail = async (req, res) => {
  try {
    const { name, email, type } = req.body;

    if (!name || !email || !type || !learningData[type]) {
      return res.status(400).json({ success: false, error: "Missing or invalid required fields" });
    }

    console.log("Sending email...");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
      },
    });

    const { title, badgeUrl, speciality, suggestions } = learningData[type];

    const mailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: email,
      subject: "🌟 Your Learning Type Report is Ready! 🌟",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="text-align: center; color: #4A90E2;">🎉 Congratulations, ${name}! 🎉</h2>
          <p style="text-align: center; font-size: 18px;">Based on your quiz results, you are a <b style="color: #E74C3C;">${title}</b>!</p>

          <div style="text-align: center; margin: 20px 0;">
            <img src="${badgeUrl}" alt="Badge" style="width: 120px; height: 120px; border-radius: 50%; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);">
          </div>

          <p style="font-size: 16px;"><b>📌 Specialty:</b> ${speciality}</p>

          <h3 style="color: #2ECC71; margin-top: 20px;">💡 How to Improve:</h3>
          <ul style="padding-left: 20px;">
            ${suggestions.map(suggestion => `<li style="margin: 10px 0;">✅ ${suggestion}</li>`).join("")}
          </ul>

          <p style="text-align: center; margin-top: 30px;">
            <i>Keep learning and growing! 🚀</i>
          </p>

          <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #777;">Best Regards,<br>📚 Learning Quiz Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully!");

    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
