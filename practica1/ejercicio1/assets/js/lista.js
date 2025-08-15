// Render de la cuadrícula de miniaturas (≈300×200 por aspect-ratio 3/2).
const $grid = document.getElementById("grid");

$grid.innerHTML = CATALOGO.map(item => `
  <article class="item">
    <a href="detalle.html?id=${encodeURIComponent(item.id)}">
      <img class="thumb" src="${item.mini}" alt="${item.titulo}" width="300" height="200" loading="lazy">
    </a>
    <div class="meta">
      <h3>${item.titulo}</h3>
      <small>${item.anios}</small>
    </div>
  </article>
`).join("");
