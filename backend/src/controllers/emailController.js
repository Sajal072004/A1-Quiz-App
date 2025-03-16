import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createCanvas, loadImage } from "canvas";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";
import {promises as fs, existsSync} from 'fs'

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const learningData = JSON.parse(
  await fs.readFile(path.join(__dirname, "../libs/learningType.json"), "utf-8")
);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generates a certificate image and uploads directly to Cloudinary.
 * @param {string} name - User's name
 * @param {string} type - Learning type (e.g., Visual, Auditory)
 * @returns {Promise<string>} - URL of uploaded certificate
 */
const generateCertificateImage = async (name, type) => {
  try {
    console.log("Generating certificate for:", name, "Type:", type);
    const templatePath = path.join(__dirname, `../templates/${learningData[type].certificate}`);

    if (!existsSync(templatePath)) {
      throw new Error(`Certificate template not found for type: ${type}`);
    }

    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);

    ctx.font = "100px Helvetica Bold";
    ctx.fillStyle = "rgb(8, 82, 81)";
    ctx.fillText(name, 550, 1080);

    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    ctx.font = "45px Helvetica Oblique";
    ctx.fillStyle = "rgb(30, 254, 254)";
    ctx.fillText(formattedDate, 346, 1970);

    ctx.font = "90px Helvetica Bold";
    ctx.fillStyle = "rgb(8, 82, 81)";
    ctx.fillText(learningData[type].title, 500, 1535);

    const buffer = canvas.toBuffer("image/png");

    // Correct Cloudinary upload
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { resource_type: "image", folder: "certificates", public_id: `${name}_certificate_${Date.now()}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    console.log("Uploaded certificate URL:", uploadResponse.secure_url);
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};


/**
 * Handles email sending with the certificate.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const sendEmail = async (req, res) => {
  try {
    console.log("Received email request:", req.body);
    const { name, email, type } = req.body;
    
    if (!name || !email || !type || !learningData[type]) {
      return res.status(400).json({ success: false, error: "Missing or invalid required fields" });
    }

    // Start generating the certificate
    const certificatePromise = generateCertificateImage(name, type);

    // Prepare email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
      },
    });

    const emailText = `
    <!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    h1 {
      color: #2c3e50;
    }
    .badge-img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 10px 0;
    }
    .speciality {
      font-size: 18px;
      color: #555;
      margin: 10px 0;
    }
    .suggestions {
      background: #ecf0f1;
      padding: 10px;
      border-radius: 8px;
      text-align: left;
      margin: 15px 0;
    }
    .suggestions ul {
      padding-left: 20px;
    }
    .certificate-btn {
      display: inline-block;
      background: #3498db;
      color: #ffffff;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 20px;
    }
    .footer {
      font-size: 12px;
      color: #888;
      margin-top: 20px;
    }
  </style>
</head>
<body>

  <div class="container">
    <h1>🎉 Congratulations, {name}! 🎉</h1>

    <p class="speciality">You have been identified as a <strong>{title}</strong>!</p>

    <img src="{badgeUrl}" alt="Learning Badge" class="badge-img">

    <p class="speciality">🌟 Speciality: {speciality}</p>

    <div class="suggestions">
      <h3>📌 Learning Suggestions:</h3>
      <ul>
        {suggestions}
      </ul>
    </div>

    <a href="{pdfUrl}" class="certificate-btn">🏅 Download Your Certificate</a>

    <p class="footer">Keep learning and growing! 🚀</p>
  </div>

</body>
</html>`;

    // Get Certificate URL
    const pdfUrl = await certificatePromise;
    if (!pdfUrl) {
      throw new Error("Failed to generate certificate URL");
    }

    // Replace the URL in email
    const formattedEmailText = emailText
  .replace("{name}", name)
  .replace("{title}", learningData[type].title)
  .replace("{speciality}", learningData[type].speciality)
  .replace("{badgeUrl}", learningData[type].badgeUrl)
  .replace("{suggestions}", learningData[type].suggestions.map((s) => `<li>${s}</li>`).join(""))
  .replace("{pdfUrl}", pdfUrl);

    const mailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      to: email,
      subject: "🎓 Your Personalized Certificate & Learning Report!",
      html: formattedEmailText,
    };

    // Send email in parallel
    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully to:", email);
    return res.json({ success: true, message: "Email sent successfully!", pdfUrl });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Handles API request to generate a certificate and return its URL.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getCertificatePDF = async (req, res) => {
  try {
    console.log("Received certificate request:", req.query);
    const { name, type } = req.query;
    
    if (!name || !type || !learningData[type]) {
      return res.status(400).json({ success: false, error: "Missing or invalid parameters" });
    }

    const pdfUrl = await generateCertificateImage(name, type);
    return res.json({ success: true, pdfUrl });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
