let media = 'https://files.catbox.moe/9b4u20.mp4'; // URL del video

let handler = async (m, { conn }) => {
    await m.react('🌷'); // Reacción al mensaje

    let messageText = `*📍 GRUPOS OFICIALES*

   *_〾̷̸‣⃝⃨⃛⃰⁝̵̓ᝒ̷̸͙🌹̶̩ܻᝒ̷̸꯭͙𝐘𝐮𝐤𝐢_𝐒𝐮𝐨𝐮-𝐁𝐨𝐭𓆩֟֯፝⃝⃙̻⃮̋⃛⃰⁌̷̸̊͟⿻᳔̶̷̸_*
   ┃🪷❏ ${gp4}

   *_ ͟͞〾⃝̵͡♡⃝𝓨𝓾𝓴𝓲 𝓢𝓾𝓸𝓾 𝓑𝓸𝓣 𝓞𝓯𝓲𝓬𝓲𝓪𝓵ᚐ҉ᚐ_* 
   ┃🌸❏ https://chat.whatsapp.com/E78uEs2qJIE0apCLB7rSQZ
   
   *_❦𝒴𝓊𝓀𝒾 𝒮𝓊𝑜𝓊 𝐵𝑜𝓣  𝒩𝐹𝒮𝒲☙_*
   ┃🥀❏ https://chat.whatsapp.com/BELmEmNjNlv36w7ElRrOKa

   *_✿:･ﾟ✧ 𝒴𝒰𝒦𝐼 𝒮𝒰𝒪𝒰 𝐵𝒪𝒳✧ﾟ･:✿_*
   ┃🍒❏ https://chat.whatsapp.com/BuLovToIxdiLeycG2d3xJN

   *_♡⃝𝒞𝐻𝒜𝒩𝒩𝐸𝐿 𝒴𝒰𝒦𝐼 𝒮𝒰𝒪𝒰ᚐ҉ᚐ_*
   ┃🌹❏ https://whatsapp.com/channel/0029VapSIvR5EjxsD1B7hU3T
   *_╰━━━━━━━━━━━━━━━━⊜_*`;

    try {
        // Enviar el mensaje con el enlace al canal
        await conn.sendMessage(m.chat, {
            text: messageText,
            footer: 'Haz clic en el enlace para unirte al canal:',
            buttons: [{ buttonId: 'join_channel', buttonText: { displayText: 'Unirme al canal' }, type: 1 }],
            media: { url: media },
        });
    } catch (error) {
        console.error('Error al enviar el mensaje:', error); // Mensaje de error en consola
    }
};

handler.command = ['grupos', 'links', 'gruposofc', 'gruposoficiales'];
handler.register = true;
handler.exp = 10; // Puedes cambiar esto a 0 si lo deseas

export default handler;
