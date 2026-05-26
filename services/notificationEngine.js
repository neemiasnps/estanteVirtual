const { getCanais } = require('./notificationService');

const {
  enviarEmailEmprestimoCriado,
  enviarEmailEmprestimoFinalizado,
  enviarEmailLembreteEmprestimo,
  enviarEmailEmprestimoAtrasado
  } = require('./emailService');
  
const {
  gerarTemplateNovoEmprestimo,
  gerarTemplateEmprestimoFinalizado,
  gerarTemplateLembreteEmprestimo,
  gerarTemplateDevolucaoHoje,
  gerarTemplateEmprestimoAtrasado
} = require('./whatsService');

const {
  logSucesso,
  logErro
} = require('./logNotificacaoService');

const {
  criarLog,
  atualizarLog,
  marcarErro
} = require('./whatsappLogService');

const { Emprestimo } = require('../models');
const { obterDadosEmprestimoPorItem, obterDadosEmprestimo } = require('../utils/obterDadosEmprestimo');
const { enviarMensagemOmnichat } = require('./omnichatService');


/* =========================
   MAPA DE NOTIFICAÇÕES
========================= */
const NOTIFICACOES = {
  novo_emprestimo: {
    email: enviarEmailEmprestimoCriado,
    whatsapp: gerarTemplateNovoEmprestimo
  },
  finalizacao: {
    email: enviarEmailEmprestimoFinalizado,
    whatsapp: gerarTemplateEmprestimoFinalizado
  },
  lembrete_5dias: {
    email: enviarEmailLembreteEmprestimo,
    whatsapp: gerarTemplateLembreteEmprestimo
  },
  lembrete_hoje: {
    email: enviarEmailLembreteEmprestimo,
    whatsapp: gerarTemplateDevolucaoHoje
  },
  atraso: {
    email: enviarEmailEmprestimoAtrasado,
    whatsapp: gerarTemplateEmprestimoAtrasado
  }
};


/* =========================
   PAYLOAD OMNICHAT
========================= */
function montarPayload(contexto, template) {

  const payload = {
    templateId: template.templateId,
    templateTokens: template.templateTokens
  };

  const chatId = contexto?.emprestimo?.chat_id;

  const telefoneRaw =
    contexto?.aluno?.celular ||
    contexto?.aluno?.telefone;

  if (chatId) {
    payload.chatId = chatId;
    return payload;
  }

  if (telefoneRaw) {

    const clean = String(telefoneRaw).replace(/\D/g, '');

    if (clean.length < 10) {
      throw new Error('Telefone inválido');
    }

    payload.platform = 'WHATSAPP';
    payload.platformId = clean.startsWith('55')
      ? clean
      : `55${clean}`;

    return payload;
  }

  console.log('[DEBUG CONTEXTO DESTINO]', contexto);

  throw new Error('Sem destino válido para envio');
}


/* =========================
   ENGINE PRINCIPAL
========================= */
async function notificar(tipo, payload) {
  try {

    const canais = await getCanais(tipo);
    const config = NOTIFICACOES[tipo];

    console.log('[CANAIS]', canais);
    console.log('[TIPO]', tipo);

    if (!config) throw new Error(`Tipo inválido: ${tipo}`);

    let dados = null;

    // RESOLVE CONTEXTO
    if (payload.tipoContexto === 'emprestimo') {
      const id = typeof payload.emprestimoId === 'object'
        ? payload.emprestimoId.id
        : payload.emprestimoId;

      dados = await obterDadosEmprestimo(id);
    }

    if (payload.tipoContexto === 'item') {
      dados = await obterDadosEmprestimoPorItem(payload.itemId);
    }


    if (!dados) {
      throw new Error('Contexto inválido');
    }

    console.log(JSON.stringify(dados, null, 2));

  
    // =========================
    // WHATSAPP
    // =========================
    if (canais.whatsapp && config.whatsapp) {

      let log = null;

      try {

        console.log('[WHATSAPP] Gerando template');

        const template = await config.whatsapp(dados);

        console.log('[WHATSAPP] Template:', template);

        const payloadOmni = montarPayload(dados, template);

        console.log('[WHATSAPP] Payload:', payloadOmni);

        // =========================
        // CRIA LOG PENDENTE
        // =========================
        log = await criarLog({
          emprestimo_id: dados?.emprestimo?.id || null,
          emprestimo_livro_id: dados?.livro?.item_id || null,
          aluno_id: dados?.aluno?.id || null,

          telefone:
            payloadOmni.platformId ||  
            payloadOmni.chatId ||
            null,

          template_id: template.templateId,

          tipo,

          status: 'pendente',

          payload: payloadOmni
        });

        // =========================
        // ENVIO
        // =========================
        const response = await enviarMensagemOmnichat(
          payloadOmni
        );

        // =========================
        // SUCESSO
        // =========================
        await atualizarLog(log.id, {
          status: 'enviado',
          response
        });

        console.log('[WHATSAPP] Enviado');

      } catch (err) {

        console.error('[WHATSAPP ERROR]', err);

        // =========================
        // ERRO
        // =========================
        if (log) {

          await marcarErro(
            log.id,
            err.response?.data || err.message
          );
        }
      }
    }

    
    // =========================
    // EMAIL
    // =========================
    if (canais.email && config.email) {

      try {

        let dadosEmail = dados;

        if (dados.livro && !dados.livros) {
          dadosEmail = {
            ...dados,
            livros: [dados.livro]
          };
        }

        console.log('[EMAIL] Dados:', dadosEmail);

        const response = await config.email(
          dadosEmail
        );

        console.log('[EMAIL] Enviado');

        // =========================
        // LOG SUCESSO
        // =========================
        await logSucesso({

          emprestimo_id:
            dados?.emprestimo?.id || null,

          emprestimo_livro_id:
            dados?.livro?.emprestimo_livro_id || null,

          aluno_id:
            dados?.aluno?.id || null,

          canal: 'email',

          tipo,

          destinatario:
            dados?.aluno?.email || null,

          status: 'enviado',

          payload: dadosEmail,

          response
        });

      } catch (err) {

        console.error('[EMAIL ERROR]', err);

        // =========================
        // LOG ERRO
        // =========================
        await logErro({

          emprestimo_id:
            dados?.emprestimo?.id || null,

          emprestimo_livro_id:
            dados?.livro?.emprestimo_livro_id || null,

          aluno_id:
            dados?.aluno?.id || null,

          canal: 'email',

          tipo,

          destinatario:
            dados?.aluno?.email || null,

          erro:
            err.message,

          payload:
            dados,

          response:
            err?.response?.data || null
        });
      }
    }

  } catch (error) {
    console.error('[NOTIFICATION ENGINE]', error.message);
  }
}


module.exports = { notificar };