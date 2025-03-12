import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";

dotenv.config();

// Fix for JSON import issue in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const learningData = JSON.parse(
  readFileSync(path.join(__dirname, "../libs/learningType.json"), "utf-8")
);

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to generate and upload PDF to Cloudinary
const generateCertificatePDF = async (name, type) => {
  const templatePath = path.join(__dirname, `../templates/${learningData[type].certificate}`);

  if (!existsSync(templatePath)) {
    throw new Error(`Certificate template not found for type: ${type}`);
  }

  // Load the selected certificate template
  const pdfBytes = readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Define exact positions based on image analysis
  const nameX = 250; // X-coordinate for name
  const nameY = 403; // Y-coordinate for name
  const dateX = 120; // X-coordinate for date
  const dateY = 83; // Y-coordinate for date

  // Add name dynamically
  firstPage.drawText(name, {
    x: nameX,
    y: nameY,
    size: 35,
    color: rgb(8 / 255, 82 / 255, 81 / 255), // Converted to range 0-1
    font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
});

const formattedDate = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// Add date dynamically
firstPage.drawText(formattedDate, {
    x: dateX,
    y: dateY,
    size: 18,
    color: rgb(0 / 255, 254 / 255, 254 / 255), // Cyan color in 0-1 range
    font: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
});


  // Save modified PDF to temporary file
  const newPdfBytes = await pdfDoc.save();
  const tempFilePath = path.join(__dirname, "../generated", `${name}_certificate.pdf`);
  writeFileSync(tempFilePath, newPdfBytes);

  // Upload to Cloudinary
  const uploadResponse = await cloudinary.v2.uploader.upload(tempFilePath, {
    resource_type: "raw", // Important for PDFs
    folder: "certificates",
    public_id: `${name}_certificate`,
    format: "pdf",
  });

  // Delete local generated file after upload
  unlinkSync(tempFilePath);

  return uploadResponse.secure_url; // Cloudinary PDF URL
};


// Send Email Function (Now uses Cloudinary URL)
export const sendEmail = async (req, res) => {
  try {
    const { name, email, type } = req.body;

    if (!name || !email || !type || !learningData[type]) {
      return res.status(400).json({ success: false, error: "Missing or invalid required fields" });
    }

    console.log("Generating PDF and uploading to Cloudinary...");
    const pdfUrl = await generateCertificatePDF(name, type);

    console.log("Sending email...");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: email,
      subject: "🎓 Your Personalized Certificate & Learning Report!",
      text: `Congratulations ${name}! Your learning certificate is available at the following link: ${pdfUrl}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    return res.json({ success: true, message: "Email sent successfully!", pdfUrl });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// API to get Cloudinary PDF URL
export const getCertificatePDF = async (req, res) => {
  try {
    const { name, type } = req.query;

    if (!name || !type || !learningData[type]) {
      return res.status(400).json({ success: false, error: "Missing or invalid parameters" });
    }

    console.log("Generating and uploading certificate PDF...");
    const pdfUrl = await generateCertificatePDF(name, type);

    return res.json({ success: true, pdfUrl });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
