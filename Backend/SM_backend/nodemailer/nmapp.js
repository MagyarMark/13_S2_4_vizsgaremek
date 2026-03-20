require('dotenv').config({path: './.env'});
const nodeMailer = require('nodemailer');

const html = `
    <img src="cid:sm_logo_cid" width="400">
    <h1>Hello World</h1>
    <p>Isn't NodeMailer usefu?</p>
`;

async function main() {

    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const info = await transporter.sendMail({
        from: `SmartManager <${process.env.EMAIL_USER}>`,
        to: 'nagy.huba.kende@diak.szbi-pg.hu',
        subject: 'Testing, testing, 123',
        html: html,
        attachments: [
            {
                filename: 'sm_logo.png',
                path: './sm_logo.png',
                cid: 'sm_logo_cid',
            }
        ]

    });

    console.log("Message sent: " + info.messageId);

}

main()
.catch(e => console.log(e));