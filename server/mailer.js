import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendSubscriberEmail = async (correo, nombre, id) => {
  try {
    const qrData = `BAMBUSUB-${id}`;
    
    // Generar Buffer del QR para incrustar en correo y PDF
    const qrBuffer = await QRCode.toBuffer(qrData, {
      color: { dark: '#2D5A5A', light: '#FFFFFF' },
      width: 250,
      margin: 1
    });

    // Generar PDF en memoria
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      
      // Diseño del PDF
      doc.rect(0, 0, doc.page.width, 100).fill('#2D5A5A');
      doc.fillColor('#FFFFFF').fontSize(24).text('Bambú Lomas', 50, 40, { align: 'center' });
      doc.fillColor('#2D5A5A').fontSize(20).text('Tarjeta de Suscriptor', 50, 150, { align: 'center' });
      doc.fillColor('#6b7280').fontSize(14).text(`¡Hola, ${nombre}!`, { align: 'center', margin: 10 });
      doc.text(`Tu ID oficial es: ${id}`, { align: 'center' });
      doc.moveDown(2);
      
      // Centrar el QR en el PDF
      const qrSize = 250;
      const xOffset = (doc.page.width - qrSize) / 2;
      doc.image(qrBuffer, xOffset, doc.y, { width: qrSize });
      
      doc.moveDown(15);
      doc.fillColor('#9ca3af').fontSize(10).text('Presenta este código en tus próximas visitas para redimir beneficios.', { align: 'center' });
      
      doc.end();
    });

    // Intentar leer el logo
    const logoPath = path.join(__dirname, '../admin/public/logo.png');
    const attachments = [
      {
        filename: 'qr-code.png',
        content: qrBuffer,
        cid: 'qrcode' // Para usar inline <img src="cid:qrcode"/>
      },
      {
        filename: `Suscripcion-Bambu-${id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ];

    let logoHtml = `<h1 style="color: #2D5A5A; margin: 0; font-size: 28px; letter-spacing: 1px;">BAMBÚ LOMAS</h1>`;
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'logo.png',
        path: logoPath,
        cid: 'bambulogo'
      });
      logoHtml = `<img src="cid:bambulogo" alt="Bambú Lomas" style="max-height: 80px; width: auto; display: block; margin: 0 auto;" />`;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: correo,
      subject: '¡Bienvenido a la familia Bambú Lomas! 🌿',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          
          <!-- Header con fondo blanco para que el logo oscuro resalte -->
          <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 4px solid #2D5A5A;">
            ${logoHtml}
          </div>

          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-bottom: 15px; font-size: 22px;">¡Qué gusto tenerte aquí, ${nombre}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              En <strong>Bambú Lomas</strong> queremos agradecerte de todo corazón por unirte a nuestra familia. 
              A partir de este momento, eres oficialmente parte de nuestro círculo de suscriptores. 
              Muy pronto estaremos preparando increíbles promociones, descuentos y beneficios de fidelidad exclusivamente para ti.
            </p>
            
            <div style="background-color: white; padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #f3f4f6; margin-top: 30px;">
              <p style="color: #374151; font-size: 15px; font-weight: 600; margin-bottom: 25px;">
                Guarda tu código QR personal
              </p>
              
              <!-- Imagen incrustada por CID (no la bloquea Gmail) -->
              <img src="cid:qrcode" alt="QR Code Suscriptor" style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 15px; background: white; max-width: 200px; width: 100%;" />
              
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Tu ID Oficial</p>
                <p style="color: #2D5A5A; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: 3px;">
                  ${id}
                </p>
              </div>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 30px; text-align: center;">
              Adicionalmente, hemos adjuntado un <strong>archivo PDF descargable</strong> a este correo con tu tarjeta digital para que puedas imprimirla o guardarla en tu dispositivo.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 25px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
              <strong>Bambú Lomas - Cocina Saludable</strong><br/>
              Si recibiste este mensaje por error, por favor ignóralo.<br/>
              © ${new Date().getFullYear()} Bambú Lomas. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
