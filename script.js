
// ==========================================
// RIFA FÁCIL - PÁGINA PRINCIPAL
// ==========================================

// CONFIGURAÇÕES
const quantidadeNumeros = 100;
const valorNumero = 5;

// ELEMENTOS HTML
const gradeNumeros = document.getElementById("numeros");
const quantidadeSelecionada = document.getElementById("quantidade");
const valorTotal = document.getElementById("total");
const formParticipante = document.getElementById("formParticipante");
const campoNome = document.getElementById("nome");
const campoTelefone = document.getElementById("telefone");
const disponibilidade = document.getElementById("disponibilidade");
const mensagemSucesso = document.getElementById("mensagemSucesso");
const btnNovaReserva = document.getElementById("btnNovaReserva");

// ELEMENTOS DO COMPROVANTE
const comprovante = document.getElementById("comprovante");
const comprovanteNome = document.getElementById("comprovanteNome");
const comprovanteTelefone = document.getElementById("comprovanteTelefone");
const comprovanteNumeros = document.getElementById("comprovanteNumeros");
const comprovanteData = document.getElementById("comprovanteData");
const comprovanteTotal = document.getElementById("comprovanteTotal");
const btnImprimir = document.getElementById("btnImprimir");

// NÚMEROS SELECIONADOS
let numerosSelecionados = [];

// RECUPERAR RESERVAS SALVAS
function recuperarParticipantes() {
    return JSON.parse(
        localStorage.getItem("rifaParticipantes")
    ) || [];
}

// IDENTIFICAR NÚMEROS OCUPADOS
function obterNumerosOcupados() {
    const participantes = recuperarParticipantes();

    return new Set(
        participantes.flatMap(function(pessoa) {
            return pessoa.numeros;
        })
    );
}

// ATUALIZAR DISPONIBILIDADE
function atualizarDisponibilidade() {
    const ocupados = obterNumerosOcupados();

    if (disponibilidade) {
        disponibilidade.textContent =
            quantidadeNumeros - ocupados.size;
    }
}

// ATUALIZAR RESUMO
function atualizarResumo() {
    quantidadeSelecionada.textContent =
        numerosSelecionados.length;

    valorTotal.textContent =
        (numerosSelecionados.length * valorNumero)
            .toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });
}

// CRIAR QUADRO DE NÚMEROS
function criarNumeros() {
    gradeNumeros.innerHTML = "";

    const ocupados = obterNumerosOcupados();

    for (let numero = 1; numero <= quantidadeNumeros; numero++) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = String(numero).padStart(3, "0");
        botao.classList.add("numero");

        if (ocupados.has(numero)) {
            botao.classList.add("ocupado");
            botao.disabled = true;
            botao.title = "Número já reservado";
        } else {
            botao.addEventListener("click", function() {
                if (numerosSelecionados.includes(numero)) {
                    numerosSelecionados =
                        numerosSelecionados.filter(function(n) {
                            return n !== numero;
                        });

                    botao.classList.remove("selecionado");
                } else {
                    numerosSelecionados.push(numero);
                    botao.classList.add("selecionado");
                }

                atualizarResumo();
            });
        }

        gradeNumeros.appendChild(botao);
    }
}

// FINALIZAR RESERVA
formParticipante.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = campoNome.value.trim();
    const telefone = campoTelefone.value.trim();

    if (numerosSelecionados.length === 0) {
        alert("Selecione pelo menos um número!");
        return;
    }

    if (!nome || !telefone) {
        alert("Preencha seu nome e telefone!");
        return;
    }

    const participantes = recuperarParticipantes();
    const ocupados = obterNumerosOcupados();

    const numeroIndisponivel = numerosSelecionados.some(
        numero => ocupados.has(numero)
    );

    if (numeroIndisponivel) {
        alert("Um dos números selecionados já foi reservado. Atualize a página e tente novamente.");
        criarNumeros();
        atualizarDisponibilidade();
        return;
    }

    const total = numerosSelecionados.length * valorNumero;

    const participante = {
        id: Date.now().toString() +
            Math.random().toString(16).slice(2),
        nome: nome,
        telefone: telefone,
        numeros: [...numerosSelecionados],
        total: total,
        data: new Date().toLocaleString("pt-BR"),
        status: "Simulação"
    };

    participantes.push(participante);

    localStorage.setItem(
        "rifaParticipantes",
        JSON.stringify(participantes)
    );

    // PREENCHER COMPROVANTE
    comprovanteNome.textContent = participante.nome;
    comprovanteTelefone.textContent = participante.telefone;

    comprovanteNumeros.textContent =
        participante.numeros
            .map(n => String(n).padStart(3, "0"))
            .join(", ");

    comprovanteData.textContent = participante.data;

    comprovanteTotal.textContent =
        "Total: " +
        total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    comprovante.style.display = "block";

    // LIMPAR SELEÇÃO
    numerosSelecionados = [];

    atualizarResumo();
    atualizarDisponibilidade();
    criarNumeros();

    formParticipante.reset();

    mensagemSucesso.innerHTML =
        "Reserva registrada com sucesso!<br>" +
        "Participante: " + nome + "<br>" +
        "Números: " +
        participante.numeros
            .map(n => String(n).padStart(3, "0"))
            .join(", ") +
        "<br>Total: " +
        total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    mensagemSucesso.style.display = "block";

    if (btnNovaReserva) {
        btnNovaReserva.style.display = "inline-block";
    }
});

// IMPRIMIR COMPROVANTE
if (btnImprimir) {
    btnImprimir.addEventListener("click", function() {
        window.print();
    });
}

// NOVA RESERVA
if (btnNovaReserva) {
    btnNovaReserva.addEventListener("click", function() {
        mensagemSucesso.style.display = "none";
        mensagemSucesso.textContent = "";
        btnNovaReserva.style.display = "none";

        comprovante.style.display = "none";

        numerosSelecionados = [];

        atualizarResumo();
        criarNumeros();
        atualizarDisponibilidade();

        formParticipante.reset();
    });
}

// INICIALIZAÇÃO
criarNumeros();
atualizarResumo();
atualizarDisponibilidade();

// ATUALIZAÇÃO AUTOMÁTICA ENTRE ABAS
window.addEventListener("storage", function(event) {
    if (event.key === "rifaParticipantes") {
        const numerosOcupados = obterNumerosOcupados();

        numerosSelecionados = numerosSelecionados.filter(
            numero => !numerosOcupados.has(numero)
        );

        criarNumeros();
        atualizarResumo();
        atualizarDisponibilidade();
    }
});