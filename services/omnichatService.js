const axios = require('axios');
const { buscarChatPorTelefone } = require('./omnichatChatService');

function normalizarTelefone(telefone) {
  if (!telefone) return null;

  const clean = String(telefone).replace(/\D/g, '');

  return clean.startsWith('55')
    ? clean
    : `55${clean}`;
}

async function enviarMensagemOmnichat({
  telefone,
  platformId,
  chatId,
  templateId,
  templateTokens,
  integrationId = process.env.OMNICHAT_INTEGRATION_ID
}) {

  try {

    const payload = {
      templateId,
      templateTokens,
      integrationId
    };

    const telefoneBase = telefone || platformId;

    const telefoneLimpo = normalizarTelefone(telefoneBase);

    // =========================
    // CASO 1: chat existente
    // =========================
    if (chatId) {
      payload.chatId = chatId;
    }

    // =========================
    // CASO 2: primeiro contato
    // =========================
    else {

      const chat = await buscarChatPorTelefone(telefoneLimpo);

      if (chat?.chatId) {
        payload.chatId = chat.chatId;

      } else {
        payload.platform = 'WHATSAPP';
        payload.platformId = telefoneLimpo;
      }
    }

    if (!payload.chatId && !payload.platformId) {
      throw new Error('Payload inválido: sem chatId ou platformId');
    }

    const response = await axios.post(
      'https://api.omni.chat/v1/messages',
      payload,
      {
        headers: {
          'x-api-key': process.env.OMNICHAT_API_KEY,
          'x-api-secret': process.env.OMNICHAT_API_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[OMNICHAT RESPONSE]', response.data);
    console.log('[DEBUG TEMPLATE ID ENVIADO]', templateId);

    return response.data;

  } catch (error) {
    console.error(
      '[OMNICHAT SEND ERROR]',
      error.response?.data || error.message
    );

    throw error;
  }
}

module.exports = {
  enviarMensagemOmnichat
};