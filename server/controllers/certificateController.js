import nodemailer from 'nodemailer';
import { createCanvas, loadImage } from 'canvas';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Certificate from '../models/Certificate.js';

// Configure Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sendCertificates = async (req, res) => {
    try {
        const { recipients, templateUrl, namePosition, qrPosition } = req.body;

        if (!recipients || !templateUrl) {
            return res.json({ success: false, message: 'Missing required data' });
        }

        const template = await loadImage(templateUrl);
        const canvas = createCanvas(template.width, template.height);
        const ctx = canvas.getContext('2d');

        const totalRecipients = recipients.length;
        const BATCH_SIZE = 50;
        const EMAIL_DELAY = 1500; // 1.5s
        const COOLDOWN = 90000; // 90s

        res.json({ success: true, message: `Starting background process for ${totalRecipients} recipients.` });

        (async () => {
            for (let i = 0; i < totalRecipients; i++) {
                const recipient = recipients[i];

                try {
                    // Construct Verification URL
                    const certId = uuidv4();
                    const baseUrl = process.env.BACKEND_URL || 'https://physiocity.org';
                    const verifyUrl = `${baseUrl}/cert-verification/${certId}`;

                    // Generate QR Code
                    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
                        margin: 1,
                        width: 150,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                    const qrImage = await loadImage(qrBuffer);

                    // Generate Certificate
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(template, 0, 0);

                    const logoPath = path.join(__dirname, '../../client/public/logo.jpg');
                    if (i === 0) console.log("Resolving logo from:", logoPath);

                    // Draw Name
                    ctx.font = `bold ${namePosition.fontSize || 40}px Arial`;
                    ctx.fillStyle = namePosition.color || '#000';
                    ctx.textAlign = 'center';
                    ctx.fillText(recipient.name, namePosition.x, namePosition.y);

                    // Draw QR Code
                    const qrSize = qrPosition?.size || 120;
                    const qrX = qrPosition?.x || (canvas.width - qrSize - 50);
                    const qrY = qrPosition?.y || (canvas.height - qrSize - 50);
                    
                    // Draw QR centered on the provided coordinates (since frontend uses translate(-50%, -50%))
                    const drawX = qrX - (qrSize / 2);
                    const drawY = qrY - (qrSize / 2);
                    ctx.drawImage(qrImage, drawX, drawY, qrSize, qrSize);

                    // Draw Verification Link Text below QR
                    const fontSize = Math.round(qrSize / 10);
                    ctx.font = `${fontSize}px sans-serif`;
                    ctx.fillStyle = '#2563eb'; // Blue color
                    ctx.textAlign = 'center';
                    ctx.fillText(verifyUrl, qrX, drawY + qrSize + (qrSize / 8));
                    
                    // Draw underline
                    const textWidth = ctx.measureText(verifyUrl).width;
                    ctx.beginPath();
                    ctx.strokeStyle = '#2563eb';
                    ctx.lineWidth = 1;
                    ctx.moveTo(qrX - (textWidth / 2), drawY + qrSize + (qrSize / 8) + 2);
                    ctx.lineTo(qrX + (textWidth / 2), drawY + qrSize + (qrSize / 8) + 2);
                    ctx.stroke();

                    const buffer = canvas.toBuffer('image/png');

                    // Create PDF with Clickable Link
                    const pdfBuffer = await new Promise((resolve) => {
                        const doc = new PDFDocument({ size: [template.width, template.height], margin: 0 });
                        const chunks = [];
                        doc.on('data', (chunk) => chunks.push(chunk));
                        doc.on('end', () => resolve(Buffer.concat(chunks)));

                        // Add the canvas image (High Res)
                        doc.image(buffer, 0, 0, { width: template.width, height: template.height });

                        // Add the Clickable Link Annotation
                        // Calculating positions based on the same logic used for ctx.fillText
                        const linkFontSize = Math.round(qrSize / 10);
                        const linkTextWidth = canvas.width * 0.5; // Roughly the width of the link text area
                        
                        // doc.link(x, y, w, h, url)
                        // x: start of text (centered), y: top of text
                        doc.link(qrX - (linkTextWidth / 2), drawY + qrSize + (qrSize / 8) - linkFontSize, linkTextWidth, linkFontSize + 10, verifyUrl);
                        
                        doc.end();
                    });

                    // Upload to Cloudinary (Upload the PDF)
                    const pdfUpload = await cloudinary.uploader.upload(`data:application/pdf;base64,${pdfBuffer.toString('base64')}`, {
                        resource_type: 'raw',
                        folder: 'issued_certificates_pdf'
                    });

                    // Also upload PNG for verification page preview
                    const imageUpload = await cloudinary.uploader.upload(`data:image/png;base64,${buffer.toString('base64')}`, {
                        folder: 'issued_certificates'
                    });

                    // Save to DB
                    await Certificate.create({
                        id: certId,
                        name: recipient.name,
                        email: recipient.email,
                        imageUrl: imageUpload.secure_url,
                        templateUrl: templateUrl
                    });

                    // Send Email with PDF
                    await transporter.sendMail({
                        from: `"Physiocity Academy" <${process.env.SMTP_USER}>`,
                        to: recipient.email,
                        subject: `Congratulations ${recipient.name}! - Your Certificate is Here`,
                        html: `
                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
                                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <div style="background-color: #1e40af; padding: 32px; text-align: center;">
                                        <img src="cid:physiocity_logo" alt="Physiocity Logo" style="height: 60px; margin-bottom: 16px;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Certificate of achievement</h1>
                                    </div>
                                    
                                    <!-- Body -->
                                    <div style="padding: 40px; text-align: center;">
                                        <p style="text-transform: uppercase; font-size: 14px; font-weight: 700; color: #6b7280; letter-spacing: 0.1em; margin-bottom: 8px;">Recognition of completion</p>
                                        <h2 style="color: #111827; font-size: 28px; font-weight: 800; margin-top: 0; margin-bottom: 24px;">Well Done, ${recipient.name}!</h2>
                                        
                                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                                            We are absolutely delighted to award you this certificate. Your dedication and hard work have truly paid off. You have successfully met all the requirements at <strong>Physiocity Academy</strong>.
                                        </p>

                                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                            <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">Your digital certificate is attached to this email as a PDF. It contains a <strong>clickable link</strong> and a <strong>QR code</strong> for instant verification.</p>
                                            <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);">Verify Certificate Online</a>
                                        </div>

                                        <p style="color: #9ca3af; font-size: 12px;">
                                            Certificate ID: <span style="font-family: monospace; background: #f3f4f6; padding: 2px 4px; border-radius: 4px;">${certId}</span>
                                        </p>
                                    </div>

                                    <!-- Footer -->
                                    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                                        <p style="color: #6b7280; font-size: 14px; margin: 0;">&copy; 2026 Physiocity Academy. All rights reserved.</p>
                                        <p style="color: #9ca3af; font-size: 12px; margin-top: 4px;">Empowering healthcare professionals through excellence.</p>
                                    </div>
                                </div>
                            </div>
                        `,
                        attachments: [
                            {
                                filename: 'physiocity_logo.jpg',
                                path: logoPath,
                                cid: 'physiocity_logo'
                            },
                            {
                                filename: `${recipient.name}_Certificate.pdf`,
                                content: pdfBuffer
                            }
                        ]
                    });

                    console.log(`Sent certificate to ${recipient.email}`);

                } catch (err) {
                    console.error(`Failed to send to ${recipient.email}:`, err.message);
                }

                await delay(EMAIL_DELAY);

                if ((i + 1) % BATCH_SIZE === 0 && (i + 1) < totalRecipients) {
                    console.log(`Batch of ${BATCH_SIZE} completed. Cooling down for 90s...`);
                    await delay(COOLDOWN);
                }
            }
            console.log('All certificates processed.');
        })();

    } catch (error) {
        console.error('Certificate Error:', error.message);
        if (!res.headersSent) {
            res.json({ success: false, message: error.message });
        }
    }
};

export const verifyCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const cert = await Certificate.findByPk(id);

        if (!cert) {
            return res.json({ success: false, message: 'Certificate not found or invalid ID' });
        }

        res.json({ success: true, certificate: cert });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
