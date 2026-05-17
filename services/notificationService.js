const { obterConfiguracao } = require('./configuracaoService');

let cacheConfig = {};
let lastLoad = 0;

async function carregarConfig() {

  const agora = Date.now();

  if (agora - lastLoad < 30000) {
    return cacheConfig;
  }

  cacheConfig = {
    whatsapp_ativo: await obterConfiguracao('whatsapp_ativo'),
    whatsapp_novo_emprestimo: await obterConfiguracao('whatsapp_novo_emprestimo'),
    whatsapp_finalizacao: await obterConfiguracao('whatsapp_finalizacao'),
    whatsapp_lembrete: await obterConfiguracao('whatsapp_lembrete'),
    whatsapp_atraso: await obterConfiguracao('whatsapp_atraso'),

    email_ativo: await obterConfiguracao('email_ativo'),
    email_novo_emprestimo: await obterConfiguracao('email_novo_emprestimo'),
    email_finalizacao: await obterConfiguracao('email_finalizacao'),
    email_lembrete: await obterConfiguracao('email_lembrete'),
    email_atraso: await obterConfiguracao('email_atraso')
  };

  lastLoad = agora;

  return cacheConfig;
}

async function getCanais(tipo) {

  const config = await carregarConfig();

  // NORMALIZA TIPOS
  let tipoBase = tipo;

  if (tipo === 'lembrete_5dias' || tipo === 'lembrete_hoje') {
    tipoBase = 'lembrete';
  }

  return {
    email:
      config.email_ativo === 'true' &&
      config[`email_${tipoBase}`] === 'true',

    whatsapp:
      config.whatsapp_ativo === 'true' &&
      config[`whatsapp_${tipoBase}`] === 'true'
  };
}

module.exports = {
  getCanais
};