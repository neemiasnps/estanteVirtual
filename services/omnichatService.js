const axios = require('axios');
const { buscarChatPorTelefone } = require('./omnichatChatService');

const API_URL = 'https://api.omni.chat/v1/messages';

function normalizarTelefone(telefone) {

  if (!telefone) return null;

  const clean = String(telefone)
    .replace(/\D/g, '');

  // Se já começa com 55
  // mantém
  if (clean.startsWith('55')) {
    return clean;
  }

  // Senão adiciona 55
  return `55${clean}`;
}

async function enviarMensagemOmnichat({
  telefone,
  platformId,
  chatId,
  templateId,
  templateTokens = [],
  integrationId = process.env.OMNICHAT_INTEGRATION_ID,
  type = 'TEXT',
  forceSend = true
}) {

  try {

    const telefoneBase =
      telefone || platformId;

    const telefoneLimpo =
      normalizarTelefone(telefoneBase);

    const payload = {
      type,
      templateId,
      templateTokens,
      integrationId,
      forceSend
    };

    // =========================
    // PRIORIDADE:
    // CHAT EXISTENTE
    // =========================
    if (chatId) {

      payload.chatId = chatId;
    }

    // =========================
    // BUSCAR CHAT
    // =========================
    else {

      const chat =
        await buscarChatPorTelefone(
          telefoneLimpo
        );

      console.log(
        '[OMNICHAT CHAT]',
        chat
      );

      if (chat?.objectId || chat?.chatId) {

        payload.chatId =
          chat.objectId || chat.chatId;

      } else {

        // IMPORTANTE:
        // alguns providers exigem:
        // 5541999999999
        // outros:
        // 5541999999999@c.us

        payload.platformId =
          telefoneLimpo;

        // payload.platformId =
        // `${telefoneLimpo}@c.us`;
      }
    }

    // =========================
    // VALIDAÇÃO
    // =========================
    if (
      !payload.chatId &&
      !payload.platformId
    ) {

      throw new Error(
        'Destino inválido'
      );
    }

    console.log(
      '[OMNICHAT PAYLOAD]',
      JSON.stringify(payload, null, 2)
    );

    const response =
      await axios.post(
        API_URL,
        payload,
        {
          timeout: 20000,

          headers: {
            'x-api-key':
              process.env.OMNICHAT_API_KEY,

            'x-api-secret':
              process.env.OMNICHAT_API_SECRET,

            'Content-Type':
              'application/json',

            'Accept':
              'application/json'
          }
        }
      );

    console.log(
      '[OMNICHAT RESPONSE]',
      response.data
    );

    return {
      success: true,
      payload,
      data: response.data
    };

  } catch (error) {

    console.error(
      '[OMNICHAT FULL ERROR]',
      error.response?.data || error
    );

    const erroTratado = {
      success: false,

      message:
        error.response?.data?.message ||
        error.message,

      status:
        error.response?.status || 500,

      data:
        error.response?.data || null
    };

    console.error(
      '[OMNICHAT ERROR]',
      erroTratado
    );

    throw erroTratado;
  }
}

module.exports = {
  enviarMensagemOmnichat
};