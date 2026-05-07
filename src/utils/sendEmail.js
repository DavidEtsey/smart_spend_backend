import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,      // your gmail
        pass: process.env.EMAIL_PASS,      // app password
      },
    });

    const mailOptions = {
      from: `"SmartSpend" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Email could not be sent");
  }
};