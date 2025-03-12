import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Fix for JSON import issue in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const learningData = JSON.parse(
  readFileSync(path.join(__dirname, "../libs/learningType.json"), "utf-8")
);

// Function to modify the PDF based on learning type
const generateCertificatePDF = async (name, type) => {
  const templatePath = path.join(__dirname, `../templates/${learningData[type].certificate}`);

  if (!existsSync(templatePath)) {
    throw new Error(`Certificate template not found for type: ${type}`);
  }

  // Ensure output directory exists
  const outputDir = path.join(__dirname, "../generated");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Load the selected certificate template
  const pdfBytes = readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Add name & date dynamically
  firstPage.drawText(name, {
    x: 250,
    y: 300,
    size: 30,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(new Date().toLocaleDateString(), {
    x: 450,
    y: 270,
    size: 18,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save modified PDF
  const newPdfBytes = await pdfDoc.save();
  const outputPath = path.join(outputDir, `${learningData[type].certificate}`);
  writeFileSync(outputPath, newPdfBytes);

  return outputPath;
};

// Send Email Function
export const sendEmail = async (req, res) => {
  try {
    const { name, email, type } = req.body;

    if (!name || !email || !type || !learningData[type]) {
      return res.status(400).json({ success: false, error: "Missing or invalid required fields" });
    }

    console.log("Generating PDF...");
    const pdfPath = await generateCertificatePDF(name, type);

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
      subject: "🎓 Your Personalized Certificate & Learning Report!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f8f9fc; padding: 20px; border-radius: 10px; box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="text-align: center; background: linear-gradient(135deg, #4A90E2, #2ECC71); padding: 15px; border-radius: 8px;">
            <h2 style="color: white; margin: 0;">🎉 Congratulations, ${name}! 🎉</h2>
            <p style="color: white; font-size: 18px;">You are a <b style="color: #FFD700;">${title}</b> Learner! 🚀</p>
          </div>

          <!-- Badge -->
          <div style="text-align: center; margin: 20px 0;">
            <img src="${badgeUrl}" alt="Badge" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid #FFD700; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);">
          </div>

          <!-- Specialty Section -->
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
            <h3 style="color: #2E86C1; text-align: center;">📌 Your Specialty</h3>
            <p style="font-size: 16px; text-align: center; color: #555;">"${speciality}"</p>
          </div>

          <!-- Suggestions -->
          <h3 style="color: #27AE60; text-align: center; margin-top: 25px;">💡 How to Improve:</h3>
          <ul style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); list-style: none;">
            ${suggestions
              .map(
                (suggestion) => `<li style="margin: 10px 0; font-size: 16px; color: #333;">✅ ${suggestion}</li>`
              )
              .join("")}
          </ul>

          <!-- Closing Message -->
          <p style="text-align: center; margin-top: 30px; font-size: 16px;">
            <i>Keep learning and growing! 📚</i>
          </p>

          <!-- Footer -->
          <div style="text-align: center; padding: 10px; background: #2C3E50; color: white; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px;">Best Regards,<br><b>A1 Academy Team</b> | <a href="#" style="color: #FFD700; text-decoration: none;">Visit Us</a></p>
          </div>

        </div>
      `,
      attachments: [
        {
          filename: `${name}_certificate.pdf`,
          content: readFileSync(pdfPath),
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully!");

    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
