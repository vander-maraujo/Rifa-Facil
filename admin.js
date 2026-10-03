
// ==========================================
// RECUPERAR PARTICIPANTES SALVOS
// ==========================================

let participantes = JSON.parse(
    localStorage.getItem("rifaParticipantes")
) || [];

// ==========================================
// GARANTIR ID ÚNICO PARA CADA RESERVA
// ==========================================

participantes.forEach(function(pessoa) {
    if (!pessoa.id) {
        pessoa.id = Date.now().toString() +
            Math.random().toString(16).slice(2);
    }
});

localStorage.setItem(
    "rifaParticipantes",
    JSON.stringify(participantes)
);

// ==========================================
// LOCALIZAR ELEMENTOS HTML
// ==========================================

const totalParticipantes = document.getElementById("totalParticipantes");
const valorArrecadado = document.getElementById("valorArrecadado");
const lista = document.getElementById("listaParticipantes");
const numerosDisponiveis = document.getElementById("numerosDisponiveis");
const numerosReservados = document.getElementById("numerosReservados");
const numerosPagos = document.getElementById("numerosPagos");
const pesquisa = document.getElementById("pesquisa");

// ==========================================
// ATUALIZAR INDICADORES GERAIS
// ==========================================

function atualizarIndicadores() {

    totalParticipantes.textContent = participantes.length;

    const valorTotal = participantes.reduce(function(soma, pessoa) {
        return soma + pessoa.total;
    }, 0);

    valorArrecadado.textContent = valorTotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// ==========================================
// ATUALIZAR INDICADORES DA RIFA
// ==========================================

function atualizarIndicadoresRifa() {

    const pagos = participantes
        .filter(pessoa => pessoa.status === "Pago")
        .reduce((soma, pessoa) => soma + pessoa.numeros.length, 0);

    const reservados = participantes
        .filter(pessoa => pessoa.status !== "Pago")
        .reduce((soma, pessoa) => soma + pessoa.numeros.length, 0);

    const numerosOcupados = new Set(
        participantes.flatMap(pessoa => pessoa.numeros)
    );

    const disponiveis = 100 - numerosOcupados.size;

    numerosDisponiveis.textContent = disponiveis;
    numerosReservados.textContent = reservados;
    numerosPagos.textContent = pagos;
}

// ==========================================
// EXIBIR PARTICIPANTES
// ==========================================

function exibirParticipantes() {

    lista.innerHTML = "";

    participantes.forEach(function(pessoa, indice) {

        const linha = document.createElement("tr");

        linha.dataset.busca =
            (pessoa.nome + " " + pessoa.telefone).toLowerCase();

        const nome = document.createElement("td");
        nome.textContent = pessoa.nome;

        const telefone = document.createElement("td");
        telefone.textContent = pessoa.telefone;

        const numeros = document.createElement("td");
        numeros.textContent = pessoa.numeros
            .map(n => String(n).padStart(3, "0"))
            .join(", ");

        const valor = document.createElement("td");
        valor.textContent = pessoa.total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const status = document.createElement("td");
        const acoes = document.createElement("td");

        // STATUS DO PAGAMENTO

        if (pessoa.status === "Pago") {

            status.textContent = "Pago";
            status.classList.add("status-pago");

            const textoConcluido = document.createElement("span");
            textoConcluido.textContent = "Concluído";

            acoes.appendChild(textoConcluido);

        } else {

            status.textContent = "Pendente";
            status.classList.add("status-pendente");

            const botaoStatus = document.createElement("button");
            botaoStatus.textContent = "Marcar como pago";

            botaoStatus.addEventListener("click", function() {

                pessoa.status = "Pago";

                localStorage.setItem(
                    "rifaParticipantes",
                    JSON.stringify(participantes)
                );

                exibirParticipantes();
                atualizarIndicadores();
                atualizarIndicadoresRifa();

            });

            acoes.appendChild(botaoStatus);
        }

        // BOTÃO EXCLUIR RESERVA

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.style.backgroundColor = "#dc2626";

        botaoExcluir.addEventListener("click", function() {

            const confirmar = confirm(
                "Tem certeza que deseja excluir esta reserva?"
            );

            if (confirmar) {

                participantes.splice(indice, 1);

                localStorage.setItem(
                    "rifaParticipantes",
                    JSON.stringify(participantes)
                );

                exibirParticipantes();
                atualizarIndicadores();
                atualizarIndicadoresRifa();

            }
        });

        acoes.appendChild(botaoExcluir);

        // ADICIONAR DADOS À LINHA

        linha.append(
            nome,
            telefone,
            numeros,
            valor,
            status,
            acoes
        );

        lista.appendChild(linha);

    });
}

// ==========================================
// PESQUISAR PARTICIPANTES
// ==========================================

pesquisa.addEventListener("input", function() {

    const texto = pesquisa.value.toLowerCase();

    const linhas = lista.querySelectorAll("tr");

    linhas.forEach(function(linha) {

        const nomeTelefone = linha.dataset.busca;

        if (nomeTelefone.includes(texto)) {
            linha.style.display = "";
        } else {
            linha.style.display = "none";
        }

    });

});

// ==========================================
// EXECUTAR AO ABRIR O PAINEL
// ==========================================

exibirParticipantes();
atualizarIndicadores();
atualizarIndicadoresRifa();