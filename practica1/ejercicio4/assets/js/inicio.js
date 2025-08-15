const frmEdad = document.getElementById("frmEdad");
const inpNac = document.getElementById("nacimiento");

frmEdad.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inpNac.value) return inpNac.reportValidity();

  const edad = calcularEdad(inpNac.value);
  if (edad < 21) {
    alert("Lo sentimos, no puedes jugar. Debes tener al menos 21 años.");
    setTimeout(() => location.replace("inicio.html"), 5000);
    return;
  }
  localStorage.setItem("edadOK", "1");
  localStorage.setItem("fechaNacimiento", inpNac.value);
  location.href = "juego.html";
});
