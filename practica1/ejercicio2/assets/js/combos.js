// --- Referencias de UI
const frm = document.getElementById("frmPedido");
const iCliente = document.getElementById("cliente");
const selPlato = document.getElementById("plato");
const radiosBebidas = [...document.querySelectorAll('input[name="bebida"]')];
const checksOpc = [...document.querySelectorAll('input[type="checkbox"]')];
const comboBtns = [...document.querySelectorAll(".btn.combo")];
const btnCancelar = document.getElementById("btnCancelar");

// --- Aplica un combo (rellenar Select, Checkboxes y Radio)
function aplicarCombo(n) {
  const c = COMBOS[n];
  if (!c) return;

  // Plato
  selPlato.value = c.plato;

  // Opcionales
  const set = new Set(c.opcionales);
  checksOpc.forEach(ch => ch.checked = set.has(ch.value));

  // Bebida
  radiosBebidas.forEach(r => r.checked = (r.value === c.bebida));

  // Estilo activo en botón
  comboBtns.forEach(b => b.classList.toggle("active", b.dataset.combo === String(n)));
}

// --- Eventos de botones COMBO
comboBtns.forEach(btn => {
  btn.addEventListener("click", () => aplicarCombo(btn.dataset.combo));
});

// --- Cancelar: limpia selección visual de combos además del form
btnCancelar.addEventListener("click", () => {
  comboBtns.forEach(b => b.classList.remove("active"));
  // form.reset() lo hará el navegador (por ser type="reset")
});

// --- Envío / Validación / Almacenamiento
frm.addEventListener("submit", (ev) => {
  ev.preventDefault();

  // Validación nativa + chequeo de bebida (radio group)
  if (!frm.reportValidity()) return;

  const cliente = iCliente.value.trim();
  const plato = selPlato.value;
  const bebida = (radiosBebidas.find(r => r.checked) || {}).value;
  const opcionales = checksOpc.filter(ch => ch.checked).map(ch => ch.value);

  if (!cliente || !plato || !bebida) {
    // Redundante por "required", pero nos aseguramos.
    alert("Por favor, complete los campos obligatorios (Cliente, Plato, Bebida).");
    return;
  }

  const pedido = {
    cliente,
    plato,
    opcionales,
    bebida,
    fechaISO: new Date().toISOString()
  };

  localStorage.setItem("pedidoActual", JSON.stringify(pedido));
  // Redirige a factura
  location.href = "factura.html";
});
