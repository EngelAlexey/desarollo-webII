// Precios y datos base (fuente única para combos y factura)
const PRECIOS = {
  platos: {
    "Pollo en salsa blanca con hongos": 3200,
    "Costilla de cerdo agridulce": 3800,
    "Pescado en salsa de ostiones": 3500, // coincide con el ejemplo de la guía
    "Beefsteack a la barbacoa": 4200
  },
  opcionales: {
    "Aros de Cebolla": 700,
    "Vinagreta": 300,
    "Verduras al vapor": 600,          // coincide con la guía
    "Tortilla casera": 500,
    "Puré nuestra tierra": 850         // coincide con la guía
  },
  bebidas: {
    "Gaseosa": 600,
    "Natural (500 ml)": 650,           // coincide con la guía
    "Café negro": 500,
    "Café con leche": 650,
    "Agua (250 ml)": 400
  },
  iva: 0.15
};

// Definición de los 3 COMBOS (autorrelleno)
const COMBOS = {
  1: {
    plato: "Pescado en salsa de ostiones",
    opcionales: ["Verduras al vapor", "Puré nuestra tierra"],
    bebida: "Natural (500 ml)"
  },
  2: {
    plato: "Pollo en salsa blanca con hongos",
    opcionales: ["Aros de Cebolla", "Tortilla casera"],
    bebida: "Gaseosa"
  },
  3: {
    plato: "Beefsteack a la barbacoa",
    opcionales: ["Vinagreta"],
    bebida: "Agua (250 ml)"
  }
};

// Utilidad común
const fmtCRC = n => "¢" + new Intl.NumberFormat("es-CR").format(n);
