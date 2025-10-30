const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email endpoint
app.post("/api/send-email", async (req, res) => {
  const { email, query } = req.body;

  try {
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: "New Contact Form Submission",
      html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Query:</strong> ${query}</p>
                <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
            `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    // Email options for user
    // Email options for user
    const userMailOptions = {
      from: '"Bizpel" <info@bizpel.com>',
      to: email, // Send to the user's email
      subject: "Greetings from Bizpel!",
      html: `
                <div style="width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; text-align: left;">
                    <div style="text-align: center; margin-bottom: 50px;">
                        <img src="https://i.postimg.cc/hPc2QvsH/logo.png" alt="Bizpel Logo" style="width: 500px; height: auto;">
                    </div>
                    <p>Hi there,</p>
                    <p>
                        Thank you for reaching out to us. A member from our team will contact you soon.<br>
                        Stay tuned!
                    </p>
                    <p>
                        If you need additional support, do drop us a note on <a href="mailto:info@bizpel.com">info@bizpel.com</a>.
                    </p>
                    <p>Thank you,</p>
                    <p>Bizpel Team</p>
                    <p style="font-size: 0.9em; color: #777; text-align: center;">
                        Please do not reply to this mail as this is an automated mail service.
                    </p>
                    <p style="font-size: 0.8em; color: #aaa; text-align: center;">
                        © 2024 Bizpel Connecting Dots Pvt Ltd, Freedom Street, 4th Block, BSK 6th Stage Thalaghattapura, Bangalore
                    </p>
                </div>
            `,
    };

    // Send email to user
    await transporter.sendMail(userMailOptions);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
