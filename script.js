let pontuacao = 0;
let indicePerguntaAtual = 0;
let perguntas = [];
let temporizador;
let tempoPorPergunta;
let respostasCorretas = 0;
const totalPerguntas = 10;
const respostasErradas = [];

// Configurações de dificuldade
const configuracoesDificuldade = {
    facil: { tempo: 20, pontuacaoMinima: 0.6 },
    medio: { tempo: 15, pontuacaoMinima: 0.8 },
    dificil: { tempo: 10, pontuacaoMinima: 0.9 },
};

// Seleção de dificuldade
document.querySelectorAll('.botao-dificuldade').forEach(botao => {
    botao.addEventListener('click', () => {
        const dificuldade = botao.getAttribute('data-dificuldade');
        tempoPorPergunta = configuracoesDificuldade[dificuldade].tempo;
        buscarPerguntas();
    });
});

// Buscar perguntas da PokeAPI
async function buscarPerguntas() {
    perguntas = [];
    for (let i = 0; i < totalPerguntas; i++) {
        const idAleatorio = Math.floor(Math.random() * 898) + 1;
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${idAleatorio}`);
        const dados = await resposta.json();

        const tipos = dados.types.map(tipoInfo => tipoInfo.type.name).join(", ");
        const pergunta = {
            pergunta: `Qual é o tipo do Pokémon ${dados.name.charAt(0).toUpperCase() + dados.name.slice(1)}?`,
            respostaCorreta: tipos,
            opcoes: gerarOpcoes(tipos),
            imagem: dados.sprites.front_default,
        };
        
        perguntas.push(pergunta);
    }
    iniciarJogo();
}

// Gerar opções aleatórias
function gerarOpcoes(tipoCorreto) {
    const todosTipos = [
        'fogo', 'água', 'grama', 'elétrico', 'psíquico', 'lutador', 
        'noturno', 'inseto', 'fantasma', 'dragão', 'gelo', 'terra',
        'rocha', 'normal', 'metal', 'fada'
    ];
    const opcoes = new Set([tipoCorreto]);
    
    while (opcoes.size < 4) {
        const tipoAleatorio = todosTipos[Math.floor(Math.random() * todosTipos.length)];
        opcoes.add(tipoAleatorio);
    }

    return Array.from(opcoes).sort();
}

// Iniciar o jogo
function iniciarJogo() {
    pontuacao = 0;
    indicePerguntaAtual = 0;
    respostasCorretas = 0;
    document.getElementById('selecionar-dificuldade').classList.add('hidden');
    document.getElementById('container-quiz').classList.remove('hidden');
    document.getElementById('container-resultados').classList.add('hidden');
    mostrarPergunta();
}

// Mostrar a pergunta
function mostrarPergunta() {
    const elementoPergunta = document.getElementById('pergunta');
    const elementoOpcoes = document.getElementById('opcoes');
    const botaoProxima = document.getElementById('botao-proxima');
    const imagemPokemon = document.getElementById('imagem-pokemon');

    const perguntaAtual = perguntas[indicePerguntaAtual];
    elementoPergunta.innerText = perguntaAtual.pergunta;
    imagemPokemon.src = perguntaAtual.imagem;
    elementoOpcoes.innerHTML = '';

    perguntaAtual.opcoes.forEach(opcao => {
        const botao = document.createElement('button');
        botao.innerText = opcao;
        botao.classList.add('btn', 'btn-outline-primary', 'm-1');
        botao.addEventListener('click', () => selecionarOpcao(opcao, botao));
        elementoOpcoes.appendChild(botao);
    });

    botaoProxima.classList.add('hidden');
    iniciarTemporizador();
}

// Iniciar o temporizador
function iniciarTemporizador() {
    let tempoRestante = tempoPorPergunta;
    const elementoTemporizador = document.getElementById('temporizador');
    elementoTemporizador.innerText = `Tempo: ${tempoRestante} segundos`;

    temporizador = setInterval(() => {
        tempoRestante--;
        elementoTemporizador.innerText = `Tempo: ${tempoRestante} segundos`;
        if (tempoRestante <= 0) {
            clearInterval(temporizador);
            tratarTempoEsgotado();
        }
    }, 1000);
}

// Tratar quando o tempo se esgota
function tratarTempoEsgotado() {
    respostasErradas.push(perguntas[indicePerguntaAtual]); // Anula a pergunta
    finalizarJogo();
}

// Selecionar a opção
function selecionarOpcao(opcao, botao) {
    const perguntaAtual = perguntas[indicePerguntaAtual];
    clearInterval(temporizador);

    // Definindo cores de fundo
    const opcoesButtons = document.getElementById('opcoes').querySelectorAll('button');
    opcoesButtons.forEach(b => b.disabled = true); // Desabilita todos os botões

    if (opcao === perguntaAtual.respostaCorreta) {
        pontuacao++;
        botao.classList.add('btn-sucesso');
    } else {
        respostasErradas.push(perguntaAtual);
        botao.classList.add('btn-perigo');
        // Marcar a resposta correta
        opcoesButtons.forEach(b => {
            if (b.innerText === perguntaAtual.respostaCorreta) {
                b.classList.add('btn-sucesso');
            }
        });
    }

    document.getElementById('botao-proxima').classList.remove('hidden');
}


// Próxima pergunta
document.getElementById('botao-proxima').addEventListener('click', () => {
    indicePerguntaAtual++;
    document.getElementById('texto-progresso').innerText = `${indicePerguntaAtual}/${totalPerguntas} Perguntas Respondidas`;
    const progresso = (indicePerguntaAtual / totalPerguntas) * 100;
    document.getElementById('progresso').style.width = `${progresso}%`;

    if (indicePerguntaAtual < totalPerguntas) {
        mostrarPergunta();
    } else {
        finalizarJogo();
    }
});

// Finalizar o jogo
function finalizarJogo() {
    document.getElementById('container-quiz').classList.add('hidden');
    document.getElementById('container-resultados').classList.remove('hidden');
    const porcentagemAcerto = (pontuacao / totalPerguntas) * 100;
    document.getElementById('pontuacao').innerText = `Você acertou ${pontuacao} de ${totalPerguntas} perguntas (${porcentagemAcerto.toFixed(2)}%)`;
    document.getElementById('barra-progresso').style.width = '100%';
    document.getElementById('texto-progresso').innerText = `${totalPerguntas}/${totalPerguntas} Perguntas Respondidas`;
}

// Reiniciar o jogo
document.getElementById('botao-reiniciar').addEventListener('click', () => {
    document.getElementById('container-resultados').classList.add('hidden');
    document.getElementById('selecionar-dificuldade').classList.remove('hidden');
    reiniciarJogo();
});

function reiniciarJogo() {
    indicePerguntaAtual = 0;
    pontuacao = 0;
    respostasErradas = [];
    document.getElementById('bar-progresso').style.width = '0%'; // Reseta a barra de progresso
}


// Mostrar revisão de erros e acertos
document.getElementById('botao-revisao').addEventListener('click', () => {
    const revisao = respostasErradas.map(q => `${q.pergunta} - Resposta Correta: ${q.respostaCorreta}`).join('\n');
    alert(revisao);
});
