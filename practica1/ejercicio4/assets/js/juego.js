// Bloqueo si no validó edad
if (localStorage.getItem("edadOK") !== "1") {
  location.replace("inicio.html");
}

// --- Referencias
const panelDatos = document.getElementById("panelDatos");
const frmJugador = document.getElementById("frmJugador");
const mesa = document.getElementById("mesa");
const nombreEl = document.getElementById("jugadorNombre");
const montoDispEl = document.getElementById("montoDisp");
const apuestaEl = document.getElementById("apuesta");
const tablero = document.getElementById("tablero");
const areaDados = document.getElementById("areaDados");
const emoji = document.getElementById("emoji");
const ultimoResultado = document.getElementById("ultimoResultado");
const rachaEl = document.getElementById("racha");

const finalBox = document.getElementById("final");
const mensajeFinal = document.getElementById("mensajeFinal");
const montoInicialEl = document.getElementById("montoInicial");
const montoFinalEl = document.getElementById("montoFinal");
const btnReintentar = document.getElementById("btnReintentar");

let jugador = null; // {nombre, bancoInicial, banco, dados, seleccion, racha, victoriasSeguidas}

// Renderiza los dados (2 o 3). Si pasas 'caras', las usa; si no, muestra 1.
function renderDados(n, caras=null) {
  areaDados.innerHTML = "";
  const arr = caras ?? Array.from({length:n},()=>1);
  for (const c of arr) {
    const img = document.createElement("img");
    img.className = "dado";
    img.alt = `Dado ${c}`;
    img.src = DADOS_PATH(c);
    areaDados.appendChild(img);
  }
}

function renderTablero(dados) {
  tablero.innerHTML = "";
  const min = dados === 2 ? 2 : 3;  // nunca aparece el 1; con 3 dados tampoco el 2
  const max = dados === 2 ? 12 : 18;

  for (let i=min; i<=max; i++) {
    const cel = document.createElement("div");
    cel.className = "celda";
    cel.textContent = i;
    cel.dataset.val = i;
    cel.addEventListener("click", () => {
      [...tablero.children].forEach(c => c.classList.remove("activa"));
      cel.classList.add("activa");
      jugador.seleccion = i;
    });
    tablero.appendChild(cel);
  }
}

function actualizarHUD() {
  nombreEl.textContent = jugador.nombre;
  montoDispEl.textContent = fmtCRC(jugador.banco);
  rachaEl.textContent = `Racha: ${jugador.racha}`;
}

frmJugador.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const monto = Number(document.getElementById("monto").value);
  const dados = Number(document.getElementById("cantidadDados").value);

  if (!nombre || !monto || !dados) return;
  if (dados !== 2 && dados !== 3) return;
  if (monto <= 0) return;

  jugador = {
    nombre,
    bancoInicial: monto,
    banco: monto,
    dados,
    seleccion: null,
    racha: 0,
    victoriasSeguidas: 0
  };

  panelDatos.style.display = "none";
  mesa.style.display = "block";

  renderDados(dados);
  renderTablero(dados);
  emoji.src = EMOJI.pregunta;
  ultimoResultado.textContent = "—";
  actualizarHUD();
});

document.getElementById("btnJugar").addEventListener("click", () => {
  if (!jugador) return;
  const apuesta = Number(apuestaEl.value || 0);
  if (apuesta <= 0) return alert("Indica un monto de apuesta válido.");
  if (apuesta > jugador.banco) return alert("La apuesta no puede exceder el monto disponible.");
  if (!jugador.seleccion) return alert("Selecciona un número del tablero para apostar.");

  // Tirada y actualización de UI
  const tiro = tirarDados(jugador.dados); // suma: 2–12 o 3–18 según dados
  renderDados(jugador.dados, tiro.caras);
  ultimoResultado.textContent = `Salió: ${tiro.suma}`;

  const acierta = (tiro.suma === jugador.seleccion);
  if (acierta) {
    // Gana: aumenta con la suma apostada + una suma idéntica
    jugador.banco += apuesta * 2;
    jugador.racha += 1;
    jugador.victoriasSeguidas += 1;
    emoji.src = EMOJI.feliz;
    ultimoResultado.className = "badge res-ok";
  } else {
    // Pierde: se descuenta la apuesta
    jugador.banco -= apuesta;
    jugador.racha = 0;
    jugador.victoriasSeguidas = 0;
    emoji.src = EMOJI.triste;
    ultimoResultado.className = "badge res-bad";
  }

  actualizarHUD();

  // Fin: sin dinero o 3 victorias seguidas
  if (jugador.banco <= 0 || jugador.victoriasSeguidas >= 3) {
    terminarJuego();
  }
});

function terminarJuego() {
  mesa.style.display = "none";
  finalBox.style.display = "block";

  const fin = jugador.banco;
  const ini = jugador.bancoInicial;

  montoInicialEl.textContent = fmtCRC(ini);
  montoFinalEl.textContent = fmtCRC(fin);

  let msg = "";
  if (fin === 0) msg = "Lo perdiste todo… ¡No vuelvas a jugar!";
  else if (fin > ini) msg = "Eres un ganador";
  else if (fin === ini) msg = "Te salvaste…";
  else msg = "No deberías de jugar… Retírate";
  mensajeFinal.textContent = msg;
}

btnReintentar.addEventListener("click", () => location.reload());
