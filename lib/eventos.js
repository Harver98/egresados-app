// Configuración de eventos. Para un evento nuevo, solo agrega un objeto más al array.
export const eventos = [
  {
    slug: 'frida-libre',
    nombre: 'Frida Libre — 10 Aniversario',
    subtitulo: 'Interpretado por Flora Martínez',
    fecha: '21 de noviembre, 2026 · 8:00 pm',
    lugar: 'Auditorio Luis A. Calvo, Bucaramanga',
    imagen: '/frida_libre.png',
    ticketUrl: 'https://boletaenlinea.co/los-eventos/frida-libre-con-flora-martinez-bucaramanga/',
    whatsappNumero: '573242606004',
    tituloDescuento: 'Descuento especial ASEDUIS',
    descuentoAsociado: 15,
    cuponAsociado: 'FRIDA15',
  },
  // 👇 Ejemplo de cómo se vería el próximo evento
  // {
  //   slug: 'siguiente-evento',
  //   nombre: 'Nombre del evento',
  //   subtitulo: '',
  //   fecha: '',
  //   lugar: '',
  //   imagen: '',
  //   ticketUrl: '',
  //   whatsappNumero: '573242606004',
  //   tituloDescuento: 'Descuento especial ASEDUIS',
  //   descuentoAsociado: 15,
  //   cuponAsociado: 'CODIGO2025',
  // },
]

export function getEvento(slug) {
  return eventos.find(e => e.slug === slug) || null
}