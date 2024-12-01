const items = ['yenes'];
const confirmation = {};
const DEBT_INCREMENT = 10;
const DEBT_INTERVAL = 5 * 60 * 60 * 1000;
const MIN_AMOUNT = 10;

async function handler(m, { conn, args, command }) {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[2] ? (args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '';
  const user = global.db.data.users[m.sender];

  if (command === 'prestar') {
    const loanedUser = who;
    const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(MIN_AMOUNT, (isNumber(args[0]) ? parseInt(args[0]) : MIN_AMOUNT))) * 1;

    if (!loanedUser) {
      return conn.sendMessage(m.chat, { text: '*👤 Menciona al usuario que le quieres hacer un préstamo de yenes.*' }, { quoted: m });
    }

    if (!(loanedUser in global.db.data.users)) {
      return conn.sendMessage(m.chat, { text: `*👤 El usuario ${loanedUser} no está en la base de datos.*` }, { quoted: m });
    }

    if (user.yenes < count) {
      return conn.sendMessage(m.chat, { text: '*💰 No tienes suficientes yenes para prestar.*' }, { quoted: m });
    }

    if (confirmation[loanedUser]) {
      return conn.sendMessage(m.chat, { text: '*💰 Ya hay una solicitud de préstamo pendiente para este usuario.*' }, { quoted: m });
    }

    const lenderTag = `@${m.sender.split('@')[0]}`;
    const confirmMessage = `*${lenderTag} desea prestarte ${count} yenes. ¿Aceptarás?* 
*—◉ Tienes 60 segundos para confirmar.*
*—◉ Escribe:* 
*◉ si = para aceptar*
*◉ no = para cancelar*`.trim();

    await conn.sendMessage(m.chat, { text: confirmMessage, mentions: [who] }, { quoted: m });

    confirmation[loanedUser] = {
      sender: m.sender,
      to: loanedUser,
      count,
      timeout: setTimeout(() => {
        conn.sendMessage(m.chat, { text: '*⌛ Se acabó el tiempo, no se obtuvo respuesta. Préstamo cancelado.*', mentions: [loanedUser] }, { quoted: m });
        delete confirmation[loanedUser];
      }, 60 * 1000)
    };

  } else if (command === 'pagar') {
    const amountToPay = Math.min(Number.MAX_SAFE_INTEGER, Math.max(MIN_AMOUNT, (isNumber(args[0]) ? parseInt(args[0]) : MIN_AMOUNT))) * 1;

    if (!user.debts || Object.keys(user.debts).length === 0) {
      return conn.sendMessage(m.chat, { text: '*💳 No tienes yenes en deuda para pagar.*' }, { quoted: m });
    }

    const totalDebt = Object.values(user.debts).reduce((acc, val) => acc + val, 0);

    if (amountToPay < MIN_AMOUNT) {
      return conn.sendMessage(m.chat, { text: `*💰 La cantidad mínima para pagar es ${MIN_AMOUNT} yenes.*` }, { quoted: m });
    }

    if (amountToPay > totalDebt) {
      return conn.sendMessage(m.chat, { text: `*💰 No puedes pagar más de ${totalDebt} yenes.*` }, { quoted: m });
    }

    for (const lender of Object.keys(user.debts)) {
      if (amountToPay <= user.debts[lender]) {
        user.debts[lender] -= amountToPay;
        if (user.debts[lender] <= 0) {
          delete user.debts[lender];
        }
        break;
      }
      amountToPay -= user.debts[lender];
      delete user.debts[lender];
    }

    conn.sendMessage(m.chat, { text: `*💸 Pago realizado: ${amountToPay} yenes.*` }, { quoted: m });

    if (Object.keys(user.debts).length === 0) {
      conn.sendMessage(m.chat, { text: '*🎉 Ya no debes nada.*' }, { quoted: m });
    }

  } else if (command === 'deuda') {
    if (!user.debts || Object.keys(user.debts).length === 0) {
      return conn.sendMessage(m.chat, { text: '*💳 No tienes deudas pendientes.*' }, { quoted: m });
    }

    let debtMessage = '*💳 Deudas pendientes:*\n';
    const mentions = [];

    for (const [lender, amount] of Object.entries(user.debts)) {
      debtMessage += `*— ${amount} yenes a @${lender.split('@')[0]}*\n`;
      mentions.push(lender);
    }

    conn.sendMessage(m.chat, { text: debtMessage, mentions }, { quoted: m });
  }
}

handler.before = async (m) => {
  if (m.isBaileys) return;
  if (!(m.sender in confirmation)) return;
  if (!m.text) return;

  const { timeout, to, count } = confirmation[m.sender];
  const loanedUser = global.db.data.users[to];

  if (/^no$/i.test(m.text)) {
    clearTimeout(timeout);
    delete confirmation[to];
    return conn.sendMessage(m.chat, { text: '*🔴 Cancelado, el préstamo no se realizará.*' }, { quoted: m });
  }

  if (/^si$/i.test(m.text)) {
    const lender = global.db.data.users[m.sender];
    loanedUser.yenes += count;
    loanedUser.debts = loanedUser.debts || {};
    loanedUser.debts[m.sender] = (loanedUser.debts[m.sender] || 0) + count;

    conn.sendMessage(m.chat, { text: `*💱 Se prestaron correctamente ${count} yenes a @${to.split('@')[0]}.*`, mentions: [to] }, { quoted: m });

    setInterval(() => {
      loanedUser.debts[m.sender] += DEBT_INCREMENT;
      conn.sendMessage(m.chat, { text: `*💸 La deuda ha sido aumentada en ${DEBT_INCREMENT} yenes.*`, mentions: [to] }, { quoted: m });
    }, DEBT_INTERVAL);

    clearTimeout(timeout);
    delete confirmation[to];
  }
};

handler.help = ['prestar', 'pagar', 'deuda'].map((v) => v + ' [cantidad] [@tag]');
handler.tags = ['economy'];
handler.command = ['prestar', 'pagar', 'deuda'];
handler.disabled = false;
handler.group = true;
handler.register = true;

export default handler;

function isNumber(x) {
  return !isNaN(x);
}