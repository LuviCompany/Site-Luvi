// Vercel Serverless Function — recebe o lead do formulário e envia por e-mail via Resend.
// Requer a env var RESEND_API_KEY configurada no projeto Vercel (nunca commitar a chave).

const TO_EMAIL = "contatoluvicom@gmail.com";
const FROM_EMAIL = "Luvi Company <contato@luvicompany.com.br>";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome, email, whatsapp, nicho, faturamento } = req.body || {};

  if (!nome || !email || !whatsapp || !nicho || !faturamento) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "E-mail inválido." });
  }

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `Novo lead: ${nome}`,
        html: `
          <h2>Novo lead pelo formulário do site</h2>
          <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
          <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
          <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
          <p><strong>Nicho/segmento:</strong> ${escapeHtml(nicho)}</p>
          <p><strong>Faturamento mensal:</strong> ${escapeHtml(faturamento)}</p>
        `
      })
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      return res.status(502).json({ error: "Falha ao enviar o e-mail." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("send-lead error:", err);
    return res.status(500).json({ error: "Erro interno." });
  }
};
