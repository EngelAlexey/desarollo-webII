// Obtener el id desde la URL (?id=...)
const params = new URLSearchParams(location.search);
const id = params.get("id");
const cont = document.getElementById("vista");

// Buscar en el catálogo el elemento base (título + imagen grande)
const base = CATALOGO.find(x => x.id === id);
const matriz = MATRICES[id];

if(!base || !matriz){
  cont.innerHTML = `<div style="padding:1rem">
    <h1>Elemento no encontrado</h1>
    <p>Verifica el parámetro <code>?id=...</code> o regresa a la lista.</p>
  </div>`;
} else {
  const filasHTML = matriz.map(([campo, valor]) => {
    let celda;
    if(Array.isArray(valor)){
      celda = `<ul>${valor.map(v => `<li>${v}</li>`).join("")}</ul>`;
    } else {
      celda = (campo === "Observaciones") ? `<p class="obs">${valor}</p>` : valor;
    }
    return `<tr><th>${campo}</th><td>${celda}</td></tr>`;
  }).join("");

  cont.innerHTML = `
    <img class="hero" src="${base.full}" alt="${base.titulo}" width="800" height="600">
    <h1 class="page">${base.titulo}</h1>
    <table class="tabla" role="table">
      <tbody>${filasHTML}</tbody>
    </table>
  `;
}
