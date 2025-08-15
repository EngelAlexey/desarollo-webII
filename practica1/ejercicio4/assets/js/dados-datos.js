// Utilidades y rutas de imágenes
const DADOS_PATH = (cara) => `images/dados/d${cara}.png`;
const EMOJI = {
  pregunta: "images/emoji/pregunta.png",
  feliz: "images/emoji/feliz.png",
  triste: "images/emoji/triste.png",
};

// Formateo opcional (por si quieres mostrar dinero con formato)
const fmtCRC = n => "¢" + new Intl.NumberFormat("es-CR", {minimumFractionDigits:2, maximumFractionDigits:2}).format(n);

// Edad a partir de fecha ISO (yyyy-mm-dd)
function calcularEdad(fechaISO) {
  const hoy = new Date();
  const f = new Date(fechaISO);
  let edad = hoy.getFullYear() - f.getFullYear();
  const m = hoy.getMonth() - f.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < f.getDate())) edad--;
  return edad;
}

// Tiro de N dados → {caras: [..], suma}
function tirarDados(n) {
  const caras = Array.from({length: n}, () => 1 + Math.floor(Math.random() * 6));
  return { caras, suma: caras.reduce((a,b)=>a+b,0) };
}
