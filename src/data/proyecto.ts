// Todo el contenido de la landing. Para un proyecto nuevo se edita este archivo, se cambian los vídeos de
// public/video y los pósters de public/recorrido (con `pnpm recorrido`), y nada más.
//
// IMPORTANTE: el proyecto que viene cargado es de EJEMPLO. Casa Lumbre no existe: nombre, dirección, superficies,
// precios y fechas son inventados para mostrar la plantilla. Con `demo: true` la web lo avisa arriba de todo.

export const demo = true;

export const proyecto = {
  nombre: 'Casa Lumbre',
  barrio: 'Villa Urquiza',
  ciudad: 'Buenos Aires',
  direccion: 'Av. de ejemplo 2240, Villa Urquiza',
  // Quién lo desarrolla y quién lo proyecta. Aparecen en el pie y en los datos estructurados.
  desarrolladora: 'Desarrolladora de ejemplo',
  estudio: 'Estudio de arquitectura de ejemplo',
  entrega: 'Marzo de 2028',
  avance: 38, // % de obra
  pisos: 9,
  unidades: 34,
};

export const contacto = {
  // Número en formato internacional sin "+" ni espacios. El formulario abre WhatsApp con el mensaje armado.
  whatsapp: '5491100000000',
  email: 'ventas@ejemplo.com',
  telefonoVisible: '+54 11 0000 0000',
  showroom: 'Showroom en obra · lunes a sábado de 10 a 18 h',
  mapa: 'https://maps.google.com/?q=Villa+Urquiza,+Buenos+Aires',
};

export const seo = {
  titulo: 'Casa Lumbre · Departamentos en Villa Urquiza con recorrido virtual',
  descripcion:
    'Recorré un 3 ambientes de Casa Lumbre antes de que esté terminado: cocina integrada, living con ventanal y balcón corrido. Unidades de 2 a 4 ambientes en pozo.',
  // URL pública final. Canonical, sitemap y og:image salen de acá (también en astro.config.mjs).
  sitio: 'https://casa-lumbre.example.com',
};

// El recorrido: una parada por ambiente. Cada parada tiene un tramo de vídeo que va de ella a la siguiente
// (`pnpm recorrido` los genera con estos nombres). `focus` es la parte horizontal del encuadre que se ve en el
// celular, de 0 (izquierda) a 100 (derecha), porque el vídeo 16:9 se recorta en vertical.
export const recorrido = {
  unidad: 'Unidad 9B · 3 ambientes',
  paradas: [
    { id: 'inicio', lugar: 'Acceso', focus: 45 },
    { id: 'cocina', lugar: 'Cocina', focus: 30 },
    { id: 'living', lugar: 'Living comedor', focus: 35 },
    { id: 'dormitorio', lugar: 'Dormitorio en suite', focus: 70 },
    { id: 'balcon', lugar: 'Balcón', focus: 40 },
  ].map((parada, i) => ({
    ...parada,
    clip: `/video/tramo-${i + 1}.mp4`,
    poster: `/recorrido/tramo-${i + 1}.webp`,
  })),
};

export const frase = ['Lo que recorrés acá', 'sale de los planos de obra,', 'no de una foto de catálogo.'];

export const unidades = [
  {
    tipo: '2 ambientes',
    cubiertos: 48.3,
    balcon: 5.1,
    orientacion: 'Contrafrente, este',
    disponibles: 6,
    detalle: 'Cocina integrada, dormitorio con placard y balcón francés al pulmón de manzana.',
  },
  {
    tipo: '3 ambientes',
    cubiertos: 74.6,
    balcon: 9.8,
    orientacion: 'Frente, norte',
    disponibles: 4,
    detalle: 'La unidad del recorrido. Dormitorio en suite, toilette y balcón corrido de punta a punta.',
    destacada: true,
  },
  {
    tipo: '4 ambientes semipiso',
    cubiertos: 112.4,
    balcon: 18.7,
    orientacion: 'Frente y lateral',
    disponibles: 2,
    detalle: 'Tres dormitorios, dos baños completos, lavadero independiente y cochera incluida.',
  },
];

export const terminaciones = [
  { icono: 'stack', titulo: 'Piso de madera', texto: 'Roble europeo de ingeniería en ambientes, porcelanato en baños y balcón.' },
  { icono: 'frameCorners', titulo: 'Carpintería con DVH', texto: 'Aluminio con ruptura de puente térmico y doble vidriado hermético.' },
  { icono: 'thermometer', titulo: 'Climatización', texto: 'Preinstalación de aire acondicionado frío calor en todos los ambientes.' },
  { icono: 'cookingPot', titulo: 'Cocina equipada', texto: 'Mesada de cuarzo, anafe de inducción y horno eléctrico empotrado.' },
  { icono: 'sun', titulo: 'Amenities en terraza', texto: 'Pileta, solárium, parrillas y laundry en el último piso.' },
  { icono: 'bicycle', titulo: 'Cocheras y bicicletero', texto: 'Cocheras en subsuelo y bicicletero cubierto en planta baja.' },
];

// Estado de cada etapa: 'hecho', 'en-curso' o 'proximo'.
export const etapas = [
  { titulo: 'Excavación y submuración', fecha: 'Febrero de 2026', estado: 'hecho' },
  { titulo: 'Estructura de hormigón', fecha: 'Octubre de 2026', estado: 'en-curso' },
  { titulo: 'Mampostería e instalaciones', fecha: 'Mayo de 2027', estado: 'proximo' },
  { titulo: 'Terminaciones y fachada', fecha: 'Diciembre de 2027', estado: 'proximo' },
  { titulo: 'Entrega de unidades', fecha: 'Marzo de 2028', estado: 'proximo' },
] as const;

export const cercanias = [
  { lugar: 'Estación de subte línea B', minutos: 6 },
  { lugar: 'Parque Sarmiento', minutos: 14 },
  { lugar: 'Av. Triunvirato, comercios', minutos: 4 },
  { lugar: 'Tren Mitre ramal Suárez', minutos: 11 },
];

export const pasos = [
  { titulo: 'Elegí la unidad', texto: 'Recorrela acá y pedí plano, precio y forma de pago por WhatsApp.' },
  { titulo: 'Visitá el showroom', texto: 'Ves terminaciones reales y el avance de la obra con alguien del equipo.' },
  { titulo: 'Reservá', texto: 'Firmás el boleto y empezás a pagar en cuotas hasta la entrega.' },
];

export const faq = [
  {
    p: '¿El departamento terminado va a ser igual al recorrido?',
    r: 'El recorrido sale del modelo 3D del proyecto aprobado, con las medidas y aberturas de los planos de obra. El mobiliario y la decoración son ilustrativos y no se entregan.',
  },
  {
    p: '¿Cómo se pagan las cuotas?',
    r: 'Con un anticipo al firmar el boleto y cuotas mensuales hasta la posesión. Las cuotas se ajustan por el índice de la Cámara Argentina de la Construcción.',
  },
  {
    p: '¿Puedo visitar la obra?',
    r: 'Sí. Coordinamos visitas guiadas los sábados por la mañana, con casco y acompañados por la dirección de obra.',
  },
  {
    p: '¿Cuándo se escritura?',
    r: 'La escritura se firma con el final de obra y la subdivisión aprobados. Hasta entonces tenés boleto de compraventa y posesión desde la entrega.',
  },
  {
    p: '¿Puedo hacer cambios en la unidad?',
    r: 'Mientras la obra esté en etapa de estructura se pueden pedir cambios de terminaciones y algunas redistribuciones de tabiques, con costo aparte.',
  },
  {
    p: '¿Aceptan permuta?',
    r: 'Evaluamos permutas por unidades terminadas en Capital Federal. Escribinos con los datos de la propiedad y te respondemos en 48 horas hábiles.',
  },
];
