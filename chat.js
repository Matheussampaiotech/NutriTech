module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ text: 'Método não permitido.' });
  }

  const { message } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ text: 'Digite sua pergunta para o Max.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      text: 'O Max está pronto, mas a chave da API ainda não foi configurada no Vercel.'
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Você é o Max, assistente da NutriTech. Responda como especialista em suplementos e saúde. Seja breve, claro e amigável. Pergunta do cliente: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Erro ao consultar Gemini');
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .join('') || 'Não consegui responder agora.';

    return res.status(200).json({ text });
  } catch (error) {
    console.error('Erro ao consultar Gemini:', error);
    return res.status(500).json({
      text: 'Desculpe, houve um erro ao conectar com o assistente. Tente novamente em instantes.'
    });
  }
};
