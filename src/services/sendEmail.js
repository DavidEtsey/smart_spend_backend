const nodemailer = require('nodemailer');

//EMAIL FOR RESET PASSWORD
const sendEmail = async (to, subject, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SmartSpend" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
          <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f9; padding:40px;">

          <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,.08);">

            <div style="background:#ffffff; padding:25px; text-align:center; border-bottom:1px solid #e5e7eb;">
              <h1 style="margin:0; font-size:34px; font-weight:700;">
                <span style="color:#22c55e;">Smart</span><span style="color:#facc15;">Spend</span>
              </h1>
              <p style="margin-top:8px; color:#6b7280;">
                Password Reset Request
              </p>
            </div>

            <div style="padding:35px; color:#333;">

              <p>Hello,</p>

              <p>
                We received a request to reset your password.
              </p>

              <p>
                Please use the verification code below:
              </p>

              <div
                style="
                  background:#eef4ff;
                  border:2px dashed #2563eb;
                  padding:18px;
                  text-align:center;
                  border-radius:8px;
                  margin:30px 0;
                ">

                <h2
                  style="
                    margin:0;
                    color:#2563eb;
                    font-size:34px;
                    letter-spacing:8px;
                  ">
                  ${resetToken}
                </h2>

              </div>

              <p>
                This code will expire in
                <strong>10 minutes</strong>.
              </p>

              <p>
                If you did not request this password reset,
                you can safely ignore this email.
              </p>

              <hr style="margin:35px 0; border:none; border-top:1px solid #ddd;">

              <p style="font-size:13px; color:#777;">
                SmartSpend Team
              </p>

            </div>

          </div>

        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Email could not be sent');
  }
};


//EMAIL FOR REPORT
const sendReportEmail = async(email,period,filePath)=>{
  try{
    const transporter =nodemailer.createTransport({
      service:"gmail",
      auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from:`"SmartSpend" <${process.env.EMAIL_USER}>`,
      to:email,
      subject:`SmartSpend ${period} Excel Report`,

      html:`
      <h3>SmartSpend Report</h3>
      <p>
      Your transaction report for 
      ${period} is attached.
      </p>
      `,

      attachments:[
        {
          filename:
          `SmartSpend-${period}.xlsx`,
          path:filePath
        }
      ]
    });

  }catch (error) {
    console.error('Email error:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = { sendEmail, sendReportEmail };