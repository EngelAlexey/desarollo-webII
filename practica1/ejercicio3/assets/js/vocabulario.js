const frm = document.getElementById("frmVocab");
const btnAplicar = document.getElementById("btnAplicar");
const btnReiniciar = document.getElementById("btnReiniciar");
const seccionResultados = document.getElementById("resultados");
const listaResultados = document.getElementById("listaResultados");
const aciertosEl = document.getElementById("aciertos");
const pporEl = document.getElementById("ppor");
const totalEl = document.getElementById("puntajeTotal");

// Ruta de imagen por defecto si falla la carga
const PLACEHOLDER = "images/vocab/placeholder.png";

// Render dinámico del formulario: Descripción + Miniatura + Input
function renderForm() {
  frm.innerHTML = VOCABULARIO.map((item, idx) => `
    <div class="quiz-item">
      <div class="quiz-desc">
        <b>${idx + 1}.</b> ${item.descripcion}
      </div>

      <img
        class="quiz-thumb"
        src="${item.imagen}"
        alt="${item.id}"
        onerror="this.onerror=null;this.src='${PLACEHOLDER}'"
      >

      <input
        type="text"
        class="quiz-input"
        name="resp_${item.id}"
        placeholder="Escribe tu respuesta"
        autocomplete="off"
        required
      >
    </div>
  `).join("");
}

// Normaliza cadenas: sin tildes, minúsculas, trim y espacios simples
function norm(s) {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "") // quita signos
    .replace(/\s+/g, " ")
    .trim();
}

// Evalúa respuestas y muestra resultados
function evaluar() {
  // Recolectar usuario
  const user = {};
  VOCABULARIO.forEach(item => {
    const inp = frm.querySelector(`[name="resp_${item.id}"]`);
    user[item.id] = inp ? inp.value : "";
  });

  // Construir resultados
  let aciertos = 0;
  const html = VOCABULARIO.map(item => {
    const esperadoNorm = item.respuestas.map(norm);
    const usuario = user[item.id] || "";
    const usuarioNorm = norm(usuario);
    const ok = esperadoNorm.includes(usuarioNorm);
    if (ok) aciertos += 1;

    const puntos = ok ? PUNTOS_POR_ACIERTO : 0;

    return `
      <div class="result-card ${ok ? "res-ok" : "res-bad"}">
        <img
          src="${item.imagen}"
          alt="${item.id}"
          class="res-img"
          onerror="this.onerror=null;this.src='${PLACEHOLDER}'"
        >
        <div class="res-body">
          <div class="res-desc"><b>Descripción:</b> ${item.descripcion}</div>
          <div class="res-esp"><b>Respuesta correcta:</b> ${item.respuestas[0]}</div>
          <div class="res-user"><b>Tu respuesta:</b> ${usuario || "<i>(vacío)</i>"}</div>
        </div>
        <div class="res-pts">${puntos}</div>
      </div>
    `;
  }).join("");

  listaResultados.innerHTML = html;
  aciertosEl.textContent = `${aciertos} / ${VOCABULARIO.length}`;
  pporEl.textContent = `${PUNTOS_POR_ACIERTO}`;
  totalEl.textContent = `${aciertos * PUNTOS_POR_ACIERTO}`;

  seccionResultados.style.display = "block";
}

// Reinicia formulario y oculta resultados
function reiniciar() {
  frm.reset();
  seccionResultados.style.display = "none";
  listaResultados.innerHTML = "";
  frm.querySelector("input")?.focus();
}

btnAplicar.addEventListener("click", () => {
  if (!frm.reportValidity()) return;
  evaluar();
});

btnReiniciar.addEventListener("click", reiniciar);

// Inicial
renderForm();
