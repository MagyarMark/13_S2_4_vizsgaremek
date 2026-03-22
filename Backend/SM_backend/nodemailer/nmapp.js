require('dotenv').config({path: './.env'});
const nodeMailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

function createTransporter() {
    return nodeMailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: (process.env.SMTP_SECURE || 'false') === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
}

async function sendVerificationEmail({ to, felhasznalonev, verificationUrl }) {
    const transporter = createTransporter();
    const logoPathCandidates = [
        path.resolve(__dirname, 'sm_logo.png'),
        path.resolve(process.cwd(), 'sm_logo.png')
    ];

    const logoPath = logoPathCandidates.find((candidate) => fs.existsSync(candidate));
    const attachments = logoPath
        ? [{ filename: 'sm_logo.png', path: logoPath, cid: 'sm_logo_cid' }]
        : [];

    const logoHtml = logoPath ? '<img src="cid:sm_logo_cid" width="220" alt="SmartManager" />' : '';

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 620px; margin: 0 auto;">
            ${logoHtml}
            <h2>SmartManager - Email megerosites</h2>
            <p>Szia ${felhasznalonev || 'felhasznalo'}!</p>
            <p>Koszonjuk a regisztraciot. A fiokod aktivalasahoz kattints az alabbi gombra:</p>
            <p>
                <a href="${verificationUrl}" style="background:#0f766e;color:#fff;padding:12px 16px;text-decoration:none;border-radius:8px;display:inline-block;">
                    Email cim megerositese
                </a>
            </p>
            <p>Ha a gomb nem mukodik, masold be ezt a linket a bongeszobe:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>A link 24 oran at ervenyes.</p>
        </div>
    `;

    return transporter.sendMail({
        from: `SmartManager <${process.env.EMAIL_USER}>`,
        to,
        subject: 'SmartManager - Email megerosites',
        html,
        attachments
    });
}

async function main() {
    const to = process.env.EMAIL_TEST_RECIPIENT || process.env.EMAIL_USER;
    const verificationUrl = process.env.EMAIL_TEST_VERIFICATION_URL || 'http://localhost:3000/api/auth/verify-email?token=teszt-token';
    const info = await sendVerificationEmail({
        to,
        felhasznalonev: 'Teszt Felhasznalo',
        verificationUrl
    });
    console.log('Message sent: ' + info.messageId);
}

if (require.main === module) {
    main().catch(e => console.log(e));
}

module.exports = {
    sendVerificationEmail,
    createTransporter,
};