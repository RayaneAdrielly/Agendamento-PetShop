const modal = document.getElementById("modal");
const fecharModal = document.getElementById("fechar-modal");
const form = document.getElementById("form-agendamento");
const agenda = document.getElementById("agenda");
const dataAgenda = document.getElementById("data-agenda");

// Carregar agendamentos do localStorage
let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

fecharModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const dados = Object.fromEntries(new FormData(form));

  // Validação de campos obrigatórios
  const camposObrigatorios = ["tutor", "pet", "telefone", "servico", "data", "hora"];
  for (const campo of camposObrigatorios) {
    if (!dados[campo]) {
      alert(`Preencha o campo: ${campo}`);
      return;
    }
  }

  // Validação de horário dentro das faixas
  if (!validarHorario(dados.hora)) {
    alert("Horário fora das faixas permitidas (08:00–22:00)");
    return;
  }

  // Prevenção de conflito
  if (verificarConflito(dados)) {
    alert("Já existe um agendamento nesse horário!");
    return;
  }

  agendamentos.push(dados);
  salvarAgendamentos();
  modal.classList.add("hidden");
  atualizarAgenda();
});

dataAgenda.addEventListener("change", atualizarAgenda);

function salvarAgendamentos() {
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

function verificarConflito(novo) {
  return agendamentos.some(a =>
    a.data === novo.data && a.hora === novo.hora
  );
}

function validarHorario(hora) {
  return hora >= "08:00" && hora <= "22:00";
}

function atualizarAgenda() {
  const dataSelecionada = dataAgenda.value;
  agenda.innerHTML = "";

  const periodos = {
    "Manhã": { inicio: "08:00", fim: "12:00", icone: "☀️", sugestao: "09:00" },
    "Tarde": { inicio: "12:01", fim: "18:00", icone: "🌤", sugestao: "14:00" },
    "Noite": { inicio: "18:01", fim: "22:00", icone: "🌙", sugestao: "19:00" },
  };

  for (const [nome, { inicio, fim, icone, sugestao }] of Object.entries(periodos)) {
    const secao = document.createElement("section");
    const titulo = document.createElement("h2");
    titulo.textContent = `${icone} ${nome} (${inicio} - ${fim})`;
    secao.appendChild(titulo);

    const btn = document.createElement("button");
    btn.textContent = "Agendar neste período";
    btn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      form.reset();
      form.elements["tutor"].focus();
      form.elements["data"].value = dataSelecionada;
      form.elements["hora"].value = sugestao;
    });
    secao.appendChild(btn);

    const ags = agendamentos
      .filter(a => a.data === dataSelecionada && a.hora >= inicio && a.hora <= fim)
      .sort((a, b) => a.hora.localeCompare(b.hora));

    ags.forEach(a => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <strong>${a.hora}</strong> - ${a.pet} (${a.tutor})<br/>
        ${a.servico}<br/>
        <button onclick="removerAgendamento('${a.data}', '${a.hora}')">Excluir</button>
      `;
      secao.appendChild(card);
    });

    agenda.appendChild(secao);
  }
}

function removerAgendamento(data, hora) {
  agendamentos = agendamentos.filter(a => !(a.data === data && a.hora === hora));
  salvarAgendamentos();
  atualizarAgenda();
}

// Inicializar com a data de hoje
dataAgenda.valueAsDate = new Date();
atualizarAgenda();
