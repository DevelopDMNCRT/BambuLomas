import QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'lealtad_qrs' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

export const sendSubscriberWhatsApp = async (numero, nombre, id) => {
  try {
    const qrData = `BAMBUSUB-${id}`;
    
    // 1. Generate QR code buffer
    const qrBuffer = await QRCode.toBuffer(qrData, {
      color: { dark: '#2D5A5A', light: '#FFFFFF' },
      width: 250,
      margin: 1
    });

    // 2. Upload to Cloudinary to get public URL
    const imageUrl = await uploadToCloudinary(qrBuffer);

    // 3. Format the phone number (remove spaces, ensure country code 52)
    const cleanNumber = numero.replace(/\D/g, '');
    const toPhone = `52${cleanNumber}`;

    // 4. Send WhatsApp template
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

    const body = {
      messaging_product: "whatsapp",
      to: toPhone,
      type: "template",
      template: {
        name: "bienvenida_lealtad",
        language: { code: "es_MX" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: { link: imageUrl }
              }
            ]
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: String(nombre) },
              { type: "text", text: String(id) }
            ]
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API Error:', JSON.stringify(data, null, 2));
      throw new Error(`Error al enviar WhatsApp: ${data.error?.message || 'Error desconocido'}`);
    }

    console.log('WhatsApp enviado correctamente:', data);
    return true;
  } catch (error) {
    console.error('Error in sendSubscriberWhatsApp:', error);
    // Return false so we don't break subscriber creation if WhatsApp fails
    return false;
  }
};
