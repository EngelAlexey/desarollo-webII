const pedidoRaw = localStorage.getItem("pedidoActual");
if (!pedidoRaw) {
  // Si no hay pedido, volvemos a combos
  location.replace("combos.html");
} else {
  const pedido = JSON.parse(pedidoRaw);

  // Consecutivo de facturas (persiste en localStorage, no se limpia)
  const consec = Number(localStorage.getItem("consecutivoFactura") || "0") + 1;
  localStorage.setItem("consecutivoFactura", String(consec));
  document.getElementById("numFactura").textContent = String(consec).padStart(8, "0");

  // Fecha/hora (sistema)
  document.getElementById("fechaHora").textContent = new Date().toLocaleString("es-CR");
  document.getElementById("clienteNombre").textContent = pedido.cliente;

  // Descripciones
  document.getElementById("platoDesc").textContent = pedido.plato;
  document.getElementById("bebidaDesc").textContent = pedido.bebida;

  // Precios
  const precioPlato = PRECIOS.platos[pedido.plato] ?? 0;
  document.getElementById("platoPrecio").textContent = fmtCRC(precioPlato);

  // Opcionales (lista + columna de precios alineada)
  const ul = document.getElementById("opcListado");
  ul.innerHTML = "";
  let subtotalOpc = 0;
  pedido.opcionales.forEach(op => {
    const li = document.createElement("li");
    li.textContent = op;
    ul.appendChild(li);
    subtotalOpc += PRECIOS.opcionales[op] ?? 0;
  });

  // Columna de precios de opcionales (misma cantidad de renglones)
  const opcPrecios = document.getElementById("opcPrecios");
  opcPrecios.innerHTML = pedido.opcionales
    .map(op => `<div>${fmtCRC(PRECIOS.opcionales[op] ?? 0)}</div>`).join("");

  const precioBebida = PRECIOS.bebidas[pedido.bebida] ?? 0;
  document.getElementById("bebidaPrecio").textContent = fmtCRC(precioBebida);

  const subtotal = precioPlato + subtotalOpc + precioBebida;
  const iva = Math.round(subtotal * PRECIOS.iva);
  const total = subtotal + iva;

  document.getElementById("subtotal").textContent = fmtCRC(subtotal);
  document.getElementById("iva").textContent = fmtCRC(iva);
  document.getElementById("total").textContent = fmtCRC(total);

  // Temporizador 10s: limpiar pedido y volver a combos
  let s = 10;
  const span = document.getElementById("seg");
  const t = setInterval(() => {
    s -= 1;
    span.textContent = s;
    if (s <= 0) {
      clearInterval(t);
      localStorage.removeItem("pedidoActual"); // requisito: limpiar datos del pedido
      location.replace("combos.html");
    }
  }, 1000);
}
