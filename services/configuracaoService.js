const { Configuracao } = require('../models');
const configuracoesPadrao = require('../config/configuracoesPadrao');

/* =========================
   CRIAR CONFIGURAÇÕES PADRÃO
========================= */
async function inicializarConfiguracoes() {

  try {

    for (const config of configuracoesPadrao) {

      const existente = await Configuracao.findOne({
        where: {
          chave: config.chave
        }
      });

      if (!existente) {

        await Configuracao.create({
          chave: config.chave,
          valor: config.valor
        });

        console.log(`Configuração criada: ${config.chave}`);
      }
    }

  } catch (error) {

    console.error('Erro ao inicializar configurações:', error);
  }
}


/* =========================
   BUSCAR CONFIGURAÇÃO
========================= */
async function obterConfiguracao(chave) {

  const config = await Configuracao.findOne({
    where: { chave }
  });

  return config ? config.valor : null;
}


/* =========================
   BUSCAR TODAS
========================= */
async function listarConfiguracoes() {

  const configs = await Configuracao.findAll({
    order: [['chave', 'ASC']]
  });

  return configs;
}


/* =========================
   ATUALIZAR CONFIGURAÇÃO
========================= */
async function atualizarConfiguracao(chave, valor) {

  const config = await Configuracao.findOne({
    where: { chave }
  });

  if (!config) {
    throw new Error(`Configuração não encontrada: ${chave}`);
  }

  config.valor = valor;

  await config.save();

  return config;
}

module.exports = {
  inicializarConfiguracoes,
  obterConfiguracao,
  listarConfiguracoes,
  atualizarConfiguracao
};