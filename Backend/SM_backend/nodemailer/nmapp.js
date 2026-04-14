require('dotenv').config({path: './.env'});
const nodeMailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// smtp kapcsolat létrehozása email küldéshez
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

// regisztráció után megerősítő email küldése
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
            <h2>SmartManager - Email megerősítés</h2>
            <p>Szia ${felhasznalonev || 'felhasználó'}!</p>
            <p>Köszönjük a regisztrációt. A fiókod aktiválásához kattints az alábbi gombra:</p>
            <p>
                <a href="${verificationUrl}" style="background:#0f766e;color:#fff;padding:12px 16px;text-decoration:none;border-radius:8px;display:inline-block;">
                    Email cím megerősítése
                </a>
            </p>
            <p>Ha a gomb nem működik, másold be ezt a linket a böngészőbe:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>A link 24 órán át érvényes.</p>
        </div>
    `;

    return transporter.sendMail({
        from: `SmartManager <${process.env.EMAIL_USER}>`,
        to,
        subject: 'SmartManager - Email megerősítés',
        html,
        attachments
    });
}

// deaktivált fiók újraaktiváló email küldése
async function sendAccountReactivationEmail({ to, felhasznalonev, reactivationUrl }) {
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
            <h2>SmartManager - Fiók reaktiváció</h2>
            <p>Szia ${felhasznalonev || 'felhasználó'}!</p>
            <p>A fiókodat deaktiváltad. Ha újra szeretnéd aktiválni, kattints az alábbi gombra, majd add meg az új bejelentkezési adataidat:</p>
            <p>
                <a href="${reactivationUrl}" style="background:#0f766e;color:#fff;padding:12px 16px;text-decoration:none;border-radius:8px;display:inline-block;">
                    Új adatok megadása és fiók reaktivációja
                </a>
            </p>
            <p>Ha a gomb nem működik, másold be ezt a linket a böngészőbe:</p>
            <p><a href="${reactivationUrl}">${reactivationUrl}</a></p>
            <p>A link 24 órán át érvényes.</p>
        </div>
    `;

    return transporter.sendMail({
        from: `SmartManager <${process.env.EMAIL_USER}>`,
        to,
        subject: 'SmartManager - Fiók reaktiváció',
        html,
        attachments
    });
}

// helyi teszt futtatás email küldés ellenőrzéshez
async function main() {
    const to = process.env.EMAIL_TEST_RECIPIENT || process.env.EMAIL_USER;
    const verificationUrl = process.env.EMAIL_TEST_VERIFICATION_URL || 'http://localhost:3000/api/auth/verify-email?token=teszt-token';
    const info = await sendVerificationEmail({
        to,
        felhasznalonev: 'Teszt Felhasználó',
        verificationUrl
    });
    console.log('Message sent: ' + info.messageId);
}

if (require.main === module) {
    main().catch(e => console.log(e));
}

module.exports = {
    sendVerificationEmail,
    sendAccountReactivationEmail,
    createTransporter,
};