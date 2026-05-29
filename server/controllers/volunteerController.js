import nodemailer from 'nodemailer';

export const submitVolunteerForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        if (!name || !email || !phone || !message) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: `"Physiocity Academy" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            replyTo: email,
            subject: `🤝 New Volunteer Applicant: ${name}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">New Volunteer Request</h1>
                        <p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-weight: 500;">Physiocity Academy Community</p>
                    </div>
                    <div style="padding: 40px; background-color: white;">
                        <div style="margin-bottom: 30px;">
                            <h3 style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px;">Applicant Profile</h3>
                            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 16px;">
                                <p style="margin: 0 0 10px 0; color: #1e293b;"><strong style="color: #64748b; width: 80px; display: inline-block;">Name:</strong> ${name}</p>
                                <p style="margin: 0 0 10px 0; color: #1e293b;"><strong style="color: #64748b; width: 80px; display: inline-block;">Email:</strong> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></p>
                                <p style="margin: 0; color: #1e293b;"><strong style="color: #64748b; width: 80px; display: inline-block;">Phone:</strong> ${phone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px;">Why they want to join</h3>
                            <div style="background-color: #fff; border: 2px dashed #e2e8f0; padding: 25px; border-radius: 16px; color: #334155; line-height: 1.6; font-style: italic;">
                                "${message}"
                            </div>
                        </div>
                        <div style="margin-top: 40px; text-align: center;">
                            <a href="mailto:${email}" style="background-color: #1e293b; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">Reply to Applicant</a>
                        </div>
                    </div>
                    <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                        © 2026 Physiocity Academy. This is an automated notification.
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        return res.json({ success: true, message: "Thank you! Your volunteer application has been submitted successfully." });
    } catch (error) {
        console.error("Volunteer Email Error:", error);
        return res.json({ success: false, message: "Failed to send application. Please try again later." });
    }
};
