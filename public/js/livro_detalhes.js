let alunoValidado = null;
let estrelasSelecionadas = 0;

document.addEventListener('DOMContentLoaded', () => {

    // MODAIS
    const modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    // SELECTS
    const selects = document.querySelectorAll('select');
    M.FormSelect.init(selects);

    // MÁSCARA CPF / E-MAIL
    const identificacaoInput = document.getElementById('identificacao');

    identificacaoInput.addEventListener('input', (e) => {

        let valor = e.target.value;

        // Se tiver letras ou @ → considera e-mail
        if (/[a-zA-Z@]/.test(valor)) {
            return;
        }

        // Remove tudo que não for número
        valor = valor.replace(/\D/g, '');

        // Limita CPF
        valor = valor.substring(0, 11);

        // Máscara CPF
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        e.target.value = valor;

    });

    // ESTRELAS INTERATIVAS
    const estrelas = document.querySelectorAll('.estrela-avaliacao');

    estrelas.forEach(estrela => {

        estrela.addEventListener('click', () => {

            estrelasSelecionadas = Number(
                estrela.dataset.value
            );

            atualizarEstrelas();

        });

    });

    // inicia com 5
    atualizarEstrelas();

    carregarDadosLivro();

});

/* =========================
   EVENTOS
========================= */
document.addEventListener('click', async (e) => {

    // ABRIR MODAL
    if (e.target.id === 'btn-avaliar') {

        const modal = M.Modal.getInstance(
            document.getElementById('modal-avaliacao')
        );

        modal.open();

    }

    // VALIDAR ALUNO
    if (e.target.id === 'btn-validar-avaliacao') {

        validarAluno();

    }

    // ENVIAR AVALIAÇÃO
    if (e.target.id === 'btn-enviar-avaliacao') {

        enviarAvaliacao();

    }

});

/* =========================
   CARREGAR DADOS DO LIVRO
========================= */
async function carregarDadosLivro() {

    try {

        const [
            livroRes,
            avaliacoesRes
        ] = await Promise.all([

            fetch(`/api/public/livros/${LIVRO_ID}`),
            fetch(`/api/public/avaliacoes/${LIVRO_ID}`)

        ]);

        const livro = await livroRes.json();

        const avaliacoesData = await avaliacoesRes.json();

        console.log('Carregando livro...');
        console.log(livro);
        console.log(avaliacoesData);

        renderLivro(livro, avaliacoesData);

    } catch (error) {

        console.error('Erro ao carregar livro:', error);

        M.toast({
            html: 'Erro ao carregar livro'
        });

    }

}

/* =========================
   RENDERIZAR LIVRO
========================= */
function renderLivro(livro, avaliacoesData) {

    const estoque = livro.Estoque || {};

    const quantidadeDisponivel = estoque.estoque_disponivel || 0;

    const disponivel = quantidadeDisponivel >= 1;

    const media = Number(avaliacoesData.mediaAvaliacoes || 0);

    const totalAvaliacoes = avaliacoesData.totalAvaliacoes || 0;

    const avaliacoes = avaliacoesData.avaliacoes || [];

    const container = document.getElementById('livro-detalhes');

    container.innerHTML = `

        <div class="card z-depth-2 livro-card-detalhes">

            <div class="row" style="margin-bottom: 0;">

                <!-- CAPA -->
                <div class="col s12 m4 center livro-capa-area">

                    <img 
                        src="${livro.foto || '/images/sem-capa.png'}"
                        alt="${livro.titulo}"
                        class="responsive-img livro-capa z-depth-3"
                    >

                    <div class="livro-status ${disponivel ? 'disponivel' : 'indisponivel'}">

                        ${
                            disponivel
                                ? 'Disponível para empréstimo'
                                : 'Indisponível no momento'
                        }

                    </div>

                    ${
                        disponivel
                            ? `
                                <a 
                                    href="https://wa.me/5541998000484?text=Tenho%20interesse%20no%20livro%20${encodeURIComponent(livro.titulo)}"
                                    target="_blank"
                                    class="btn green waves-effect waves-light btn-emprestimo"
                                >
                                    Solicitar empréstimo
                                </a>
                            `
                            : ''
                    }

                </div>

                <!-- DADOS -->
                <div class="col s12 m8 livro-info-area">

                    <h5 class="livro-titulo">
                        ${livro.titulo}
                    </h5>

                    <div class="livro-autor">
                        ${livro.autor}
                    </div>

                    <!-- ESTRELAS -->
                    <div class="livro-estrelas">

                        ${gerarEstrelas(media)}

                        <span class="media-avaliacao">

                            ${
                                totalAvaliacoes > 0
                                ? `${media.toFixed(1)} (${totalAvaliacoes} avaliações)`
                                : 'Ainda sem avaliações'
                            }

                        </span>

                    </div>

                    <div class="divider"></div>

                    <!-- GRID -->
<div class="row livro-grid-info">

    <div class="col s12 m6">
        <p>
            <strong>Editora:</strong><br>
            ${livro.editora}
        </p>
    </div>

    <div class="col s12 m6">
        <p>
            <strong>Ano:</strong><br>
            ${livro.anoPublicacao}
        </p>
    </div>

    <div class="col s12 m6">
        <p>
            <strong>Gênero:</strong><br>
            ${livro.Genero?.nome || '-'}
        </p>
    </div>

    <div class="col s12 m6">
        <p>
            <strong>Subgênero:</strong><br>
            ${livro.Subgenero?.nome || '-'}
        </p>
    </div>

    <div class="col s12 m6">
        <p>
            <strong>Gentileza:</strong><br>
            ${livro.gentileza}
        </p>
    </div>

    <div class="col s12 m6">
        <p>
            <strong>Total de empréstimos:</strong><br>
            ${livro.somaLocados}
        </p>
    </div>

    <div class="col s12 m6">
        <p>
            <strong>Estoque disponível:</strong><br>
            ${quantidadeDisponivel}
        </p>
    </div>

    <div class="col s12 m6">
        <p>
            <strong>Código do livro:</strong><br>
            #${livro.id}
        </p>
    </div>

    <!-- SINOPSE -->
    <div class="col s12">
        <div class="sinopse-box">

            <strong>Sinopse</strong>

            <p class="sinopse-texto">
                ${livro.sinopse || 'Sem sinopse cadastrada.'}
            </p>

        </div>
    </div>

</div>

                </div>

            </div>

        </div>


        <!-- COMENTÁRIOS -->
        <div class="card z-depth-1">

            <div class="card-content">

                <div class="comentario-header">

                    <span class="card-title">
                        Comentários e avaliações
                    </span>

                    <a 
                        class="btn amber darken-2 waves-effect waves-light"
                        id="btn-avaliar"
                    >
                        Avaliar livro
                    </a>

                </div>

                ${
                    avaliacoes.length > 0

                        ? `

                            <div class="lista-comentarios">

                                ${avaliacoes.map(avaliacao => `

                                    <div class="comentario-item">

                                        <div class="comentario-topo">

                                            <strong>
                                                ${avaliacao.Aluno?.nomeCompleto || 'Aluno'}
                                            </strong>

                                            <div>
                                                ${gerarEstrelas(avaliacao.estrelas)}
                                            </div>

                                        </div>

                                        <p class="comentario-texto">
                                            ${avaliacao.comentario || ''}
                                        </p>

                                    </div>

                                `).join('')}

                            </div>

                        `

                        : `

                            <div class="comentarios-vazio">

                                <i class="material-icons large grey-text text-lighten-1">
                                    chat_bubble_outline
                                </i>

                                <p>
                                    Este livro ainda não possui comentários.
                                </p>

                            </div>

                        `
                }

            </div>

        </div>

    `;

}

/* =========================
   GERAR ESTRELAS
========================= */
function gerarEstrelas(media) {

    let estrelasHTML = '';

    for (let i = 1; i <= 5; i++) {

        if (i <= Math.round(media)) {

            estrelasHTML += `
                <i class="material-icons amber-text">
                    star
                </i>
            `;

        } else {

            estrelasHTML += `
                <i class="material-icons grey-text">
                    star
                </i>
            `;
        }
    }

    return estrelasHTML;

}

function atualizarEstrelas() {

    const estrelas = document.querySelectorAll('.estrela-avaliacao');

    estrelas.forEach(estrela => {

        const valor = Number(estrela.dataset.value);

        if (valor <= estrelasSelecionadas) {

            estrela.innerHTML = 'star';
            estrela.classList.add('amber-text');

        } else {

            estrela.innerHTML = 'star_border';
            estrela.classList.remove('amber-text');

        }

    });

}

/* =========================
   VALIDAR ALUNO
========================= */
async function validarAluno() {

    try {

        let identificacao = document
            .getElementById('identificacao')
            .value
            .trim();

        // remove máscara caso seja CPF
        if (!identificacao.includes('@')) {

            identificacao = identificacao.replace(/\D/g, '');

        }

        if (!identificacao) {

            return M.toast({
                html: 'Informe CPF ou e-mail'
            });

        }

        const res = await fetch('/api/public/validar-avaliacao', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                identificacao,
                livro_id: LIVRO_ID
            })

        });

        const data = await res.json();

        if (!data.sucesso) {

            return M.toast({
                html: data.mensagem
            });

        }

        alunoValidado = data.aluno;

        document.getElementById('etapa-validacao').style.display = 'none';

        document.getElementById('etapa-formulario').style.display = 'block';

        M.toast({
            html: 'Validação realizada'
        });

    } catch (error) {

        console.error(error);

        M.toast({
            html: 'Erro ao validar aluno'
        });

    }

}


/* =========================
   ENVIAR AVALIAÇÃO
========================= */
async function enviarAvaliacao() {

    const btn = document.getElementById('btn-enviar-avaliacao');

    if (btn.disabled) {
        return;
    }

    try {

        btn.disabled = true;
        btn.classList.add('disabled');

        const estrelas = estrelasSelecionadas;

        // VALIDAR ESTRELAS
        if (estrelas <= 0) {

            return M.toast({
                html: 'Selecione uma quantidade de estrelas'
            });

        }

        const comentario = document
            .getElementById('comentario')
            .value
            .trim();

        if (!comentario) {

            return M.toast({
                html: 'Digite um comentário'
            });

        }

        const res = await fetch('/api/public/salvar-avaliacao', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({

                livro_id: LIVRO_ID,
                aluno_id: alunoValidado.id,
                estrelas,
                comentario

            })

        });

        const data = await res.json();

        if (!res.ok || !data.sucesso) {

            return M.toast({
                html: data.mensagem || 'Erro ao enviar avaliação'
            });

        }

        // FECHAR MODAL
        const modal = M.Modal.getInstance(
            document.getElementById('modal-avaliacao')
        );

        modal.close();

        // LIMPAR CAMPOS
        document.getElementById('comentario').value = '';
        document.getElementById('identificacao').value = '';

        // RESETAR ESTRELAS
        estrelasSelecionadas = 0;
        alunoValidado = null;

        M.toast({
            html: 'Avaliação enviada com sucesso!'
        });

        setTimeout(() => {
            location.reload();
        }, 1000);

    } catch (error) {

        console.error(error);

        M.toast({
            html: 'Erro ao enviar avaliação'
        });

    } finally {

        btn.disabled = false;
        btn.classList.remove('disabled');

    }

}