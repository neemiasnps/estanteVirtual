const axios = require('axios');

async function buscarChatPorTelefone(phone) {
  try {

    const response = await axios.get(
      'https://api.omni.chat/v1/chats',
      {
        params: {
          where: JSON.stringify({
            phone: phone
          }),
          limit: 1
        },
        headers: {
          'x-api-key': process.env.OMNICHAT_API_KEY,
          'x-api-secret': process.env.OMNICHAT_API_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    const chats = response.data?.results || [];

    if (chats.length === 0) {
      return null;
    }

    return {
      chatId: chats[0].objectId,
      platformId: chats[0].platformId,
      phone: chats[0].phone
    };

  } catch (error) {

    console.error(
      '[OMNICHAT CHAT STATUS]',
      error.response?.status
    );

    console.error(
      '[OMNICHAT CHAT DATA]',
      JSON.stringify(
        error.response?.data,
        null,
        2
      )
    );

    return null;
  }
}

module.exports = {
  buscarChatPorTelefone
};