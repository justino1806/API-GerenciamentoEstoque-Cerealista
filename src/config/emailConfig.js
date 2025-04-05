import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/* const transporter = nodemailer.createTransport({
    service: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true
}); */

/* console.log('Credenciais: ', {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
}) */
async function createTransporter() {
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: /* 465 */587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    return transporter;
    
}

export async function enviarEmail(para, nome, assunto, html) {

    const imagePath = path.join(process.cwd(), 'uploads', 'Logotipo-Cerealista.png');
    const imageBase64 = fs.readFileSync(imagePath, 'base64');
    const logoSrc = `data:image/png;base64,${imageBase64}`;
    const template = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${assunto}</title>
            <style>
                body {
                    background-color: #f4f5f6;
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .logo-wrapper {
                    text-align: center;
                    padding: 20px 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .content {
                    padding: 30px;
                }
                .header {
                    text-align: center;
                    padding: 20px;
                    background: #208c12;
                    color: white;
                    border-radius: 8px 8px 0 0;
                }
                .button {
                    background: #208c12;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 4px;
                    display: inline-block;
                    margin: 20px 0;
                    border: none;
                    cursor: pointer;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #eee;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoSrc}" alt="Cerealista Logo" class="logo-wrapper" style="max-width: 300px; width: 100%; height: auto; margin-bottom: 15px;">
                    <h1>Recuperação de Senha</h1>
                </div>
                <div class="content">
                    <h2>Olá ${nome}!</h2>
                    <p>Você solicitou a recuperação de senha para sua conta.</p>
                    <p>Clique no botão abaixo para criar uma nova senha:</p>
                    ${html}
                    <p>Se você não solicitou esta recuperação, ignore este email.</p>
                </div>
                <div class="footer">
                    <p>Cerealista Souza - Sistema de Gerenciamento</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: para,
        subject: assunto,
        html: template
    });
}