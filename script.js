const stats = {
    total: 0,
    acertos: 0,
    tempoTotal: 0,
    disciplinas: {}
};

let startTime = 0;

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function loadQuestion() {
    const container = document.getElementById('question-container');
    container.innerHTML = '<p>Carregando questão...</p>';

    const year = getRndInteger(2009, 2023);
    const index = getRndInteger(1, 180);
    const options = { method: 'GET' };

    fetch(`https://api.enem.dev/v1/exams/${year}/questions/${index}`, options)
        .then(response => response.json())
        .then(response => showQuestion(response, container))
        .catch(err => {
            console.error(err);
            container.innerHTML = `<p>Erro ao carregar a questão. Tente novamente.</p>`;
        });
}

function showQuestion(question, container) {
    const disciplina = question.discipline || 'Desconhecida';

    startTime = Date.now();

    container.innerHTML = `
    <div class="question" data-discipline="${disciplina}">
      <p><strong>${question.title}</strong></p>
      <div>${marked.parse(question.context || '')}</div>
      <p>${marked.parse(question.alternativesIntroduction || '')}</p>
      <div class="options">
        ${question.alternatives.map(({ letter, text }) => `
          <button data-letter="${letter}" onclick="checkAnswer(this, '${letter}', '${question.correctAlternative}', '${disciplina}')">${letter}: ${text}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function checkAnswer(button, selected, correct, disciplina) {
    const buttons = button.parentElement.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);

    const isCorrect = selected === correct;
    const elapsedTime = (Date.now() - startTime) / 1000;

    if (isCorrect) {
        button.classList.add('correct');
        stats.acertos++;
    } else {
        button.classList.add('wrong');
        buttons.forEach(btn => {
            if (btn.dataset.letter === correct) {
                btn.classList.add('correct');
            }
        });
    }

    stats.total++;
    stats.tempoTotal += elapsedTime;

    if (!stats.disciplinas[disciplina]) {
        stats.disciplinas[disciplina] = { total: 0, acertos: 0, tempoTotal: 0 };
    }

    const d = stats.disciplinas[disciplina];
    d.total++;
    d.tempoTotal += elapsedTime;
    if (isCorrect) d.acertos++;

    updateStats();
}

function updateStats() {
    document.getElementById('total').textContent = stats.total;
    document.getElementById('acertos').textContent = stats.acertos;
    document.getElementById('porcentagem').textContent = stats.total ? ((stats.acertos / stats.total) * 100).toFixed(1) : 0;
    document.getElementById('tempo-medio').textContent = stats.total ? (stats.tempoTotal / stats.total).toFixed(1) : 0;

    const container = document.getElementById('disciplinas-container');
    container.innerHTML = '';

    for (const [disc, dStats] of Object.entries(stats.disciplinas)) {
        const percent = dStats.total ? ((dStats.acertos / dStats.total) * 100).toFixed(1) : 0;
        const tempo = dStats.total ? (dStats.tempoTotal / dStats.total).toFixed(1) : 0;
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
      <card>
      <h4>${disc.toUpperCase()}</h4>
      <p><strong>Respondidas:</strong> ${dStats.total}</p>
      <p><strong>Acertos:</strong> ${dStats.acertos}</p>
      <p><strong>Porcentagem:</strong> ${percent}%</p>
      <p><strong>Tempo médio:</strong> ${tempo} s</p>
      </card>
    `;
        container.appendChild(card);
    }
}

function clearStats() {
    stats.total = 0;
    stats.acertos = 0;
    stats.tempoTotal = 0;
    stats.disciplinas = {};
    updateStats();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

loadQuestion();