const express = require('express');
const router = express.Router();

const {
  listarConfiguracoes,
  atualizarConfiguracao
} = require('../../services/configuracaoService');

/* =========================
   LISTAR CONFIGURAÇÕES
========================= */

router.get('/', async (req, res) => {

  try {

    const configuracoes = await listarConfiguracoes();

    return res.json(configuracoes);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Erro ao listar configurações'
    });
  }
});


/* =========================
   ATUALIZAR CONFIGURAÇÃO
========================= */

router.put('/:chave', async (req, res) => {

  try {

    const { chave } = req.params;
    const { valor } = req.body;

    if (valor === undefined) {

      return res.status(400).json({
        error: 'Valor não informado'
      });
    }

    const configuracao = await atualizarConfiguracao(
      chave,
      valor
    );

    return res.json(configuracao);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Erro ao atualizar configuração'
    });
  }
});

module.exports = router;