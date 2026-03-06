import PDFDocument from "pdfkit";
import type { Lote, User } from "@shared/schema";
import path from "path";
import fs from "fs";

const colors = {
  green: "#1B3C34",
  greenLight: "#2C5346",
  greenMid: "#3A7D6A",
  greenPale: "#E8F0ED",
  gold: "#8B6914",
  goldLight: "#C9A84C",
  cream: "#FAF8F3",
  dark: "#1A1A1A",
  gray: "#4A4A4A",
  grayMed: "#888888",
  grayLight: "#C0C0C0",
  grayUltraLight: "#F2F2F2",
  border: "#E2DDD5",
  white: "#FFFFFF",
};

const MARGIN = 40;
const FOOTER_H = 50;

interface ModeloArquitectonico {
  nombre: string;
  area: number;
  pisos: number;
  habitaciones: string;
  banos: string;
  garaje: string;
  loteMinimo: number;
  descripcion: string;
  zonaSocial: string;
  cocina: string;
  extras: string;
}

const modelos: Record<string, ModeloArquitectonico> = {
  "El Roble": {
    nombre: "El Roble",
    area: 145,
    pisos: 2,
    habitaciones: "3 habitaciones + estudio",
    banos: "3 banos (1 social, 2 privados con ducha)",
    garaje: "Garaje cubierto para 2 vehiculos (28 m2)",
    loteMinimo: 120,
    descripcion: "Diseno de dos pisos con amplios espacios sociales, ideal para familias que buscan confort y funcionalidad.",
    zonaSocial: "Sala-comedor integrado (32 m2), terraza con vista panoramica (18 m2)",
    cocina: "Cocina tipo americana con isla central (14 m2), zona de lavado independiente",
    extras: "Terraza panoramica en segundo piso, estudio multiuso, closets empotrados en todas las habitaciones",
  },
  "El Cedro": {
    nombre: "El Cedro",
    area: 95,
    pisos: 1,
    habitaciones: "2 habitaciones + sala de estar",
    banos: "2 banos (1 social, 1 privado)",
    garaje: "Zona de parqueo descubierta (15 m2)",
    loteMinimo: 100,
    descripcion: "Modelo compacto de un piso, perfecto para parejas jovenes o como inversion para renta. Diseno moderno y eficiente.",
    zonaSocial: "Sala-comedor abierto (24 m2), jardin interior con iluminacion cenital",
    cocina: "Cocina integral lineal (10 m2), zona de ropas",
    extras: "Jardin interior con iluminacion natural cenital, ventilacion cruzada, diseno bioclimatico",
  },
  "El Nogal": {
    nombre: "El Nogal",
    area: 180,
    pisos: 2,
    habitaciones: "4 habitaciones + sala de TV",
    banos: "4 banos (1 social, 3 privados, 1 con tina)",
    garaje: "Garaje cubierto para 2 vehiculos con bodega (35 m2)",
    loteMinimo: 150,
    descripcion: "Propuesta premium de dos pisos con acabados de alta gama, zonas sociales amplias y espacios para toda la familia.",
    zonaSocial: "Sala principal (28 m2), comedor formal (16 m2), sala de TV en segundo piso (20 m2)",
    cocina: "Cocina gourmet con isla y despensa (22 m2), cuarto de lavado y planchado independiente",
    extras: "Patio trasero con zona BBQ (25 m2), habitacion principal con walking closet y bano con tina, balcon en segundo piso",
  },
};

export function determinarModelo(loteArea: number): ModeloArquitectonico {
  if (loteArea >= 150) return modelos["El Nogal"];
  if (loteArea >= 120) return modelos["El Roble"];
  return modelos["El Cedro"];
}

function contentWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - MARGIN * 2;
}

function maxY(doc: PDFKit.PDFDocument): number {
  return doc.page.height - FOOTER_H - 10;
}

function checkPage(doc: PDFKit.PDFDocument, y: number, needed: number): number {
  if (y + needed > maxY(doc)) {
    docFooter(doc);
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

function docHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  const w = doc.page.width;
  const cw = contentWidth(doc);
  const headerH = 120;

  doc.rect(0, 0, w, headerH).fill(colors.green);

  doc.rect(MARGIN - 10, 10, cw + 20, headerH - 20).lineWidth(0.5).stroke(colors.goldLight);
  doc.rect(MARGIN - 7, 13, cw + 14, headerH - 26).lineWidth(0.3).stroke(colors.goldLight);

  doc.fontSize(7).fill(colors.goldLight).text("TERRANOVA GROUP  -  SISTEMA INMOBILIARIO", MARGIN, 22, { width: cw, align: "center", characterSpacing: 3 });
  doc.fontSize(17).fill(colors.white).text(title.toUpperCase(), MARGIN, 38, { width: cw, align: "center", characterSpacing: 2 });

  const lineY = 62;
  const cx = w / 2;
  doc.moveTo(cx - 80, lineY).lineTo(cx - 8, lineY).lineWidth(0.5).stroke(colors.goldLight);
  doc.moveTo(cx + 8, lineY).lineTo(cx + 80, lineY).lineWidth(0.5).stroke(colors.goldLight);
  doc.fontSize(5).fill(colors.goldLight).text("TN", MARGIN, lineY - 3, { width: cw, align: "center" });

  doc.fontSize(10).fill(colors.white).text(subtitle, MARGIN, 72, { width: cw, align: "center" });
  doc.fontSize(7).fill(colors.goldLight).text(
    `Documento generado: ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}`,
    MARGIN, 90, { width: cw, align: "center" }
  );

  doc.rect(0, headerH, w, 2).fill(colors.goldLight);
}

function docFooter(doc: PDFKit.PDFDocument) {
  const w = doc.page.width;
  const y = doc.page.height - FOOTER_H;

  doc.rect(0, y, w, FOOTER_H).fill(colors.green);
  doc.rect(0, y, w, 1.5).fill(colors.goldLight);

  const cw = contentWidth(doc);
  doc.fontSize(6).fill(colors.grayLight).text(
    "TerraNova Group - Documento con fines academicos (Proyecto ADSO-19). Exclusivo para el propietario del lote.",
    MARGIN, y + 10, { width: cw, align: "center" }
  );
  doc.fontSize(6).fill(colors.goldLight).text(
    `(C) ${new Date().getFullYear()} TerraNova Group - Todos los derechos reservados`,
    MARGIN, y + 24, { width: cw, align: "center" }
  );
}

function sectionTitle(doc: PDFKit.PDFDocument, y: number, title: string): number {
  const cw = contentWidth(doc);
  y = checkPage(doc, y, 30);
  doc.rect(MARGIN, y, cw, 20).fill(colors.greenLight);
  doc.fontSize(8).fill(colors.white).text(title.toUpperCase(), MARGIN + 12, y + 6, { width: cw - 24, characterSpacing: 1.5 });
  return y + 26;
}

function infoRow(doc: PDFKit.PDFDocument, y: number, label: string, value: string, isAlt: boolean): number {
  const cw = contentWidth(doc);
  const labelW = Math.round(cw * 0.32);
  const valueW = cw - labelW;
  const padding = 8;

  const textH = doc.fontSize(8).heightOfString(value, { width: valueW - padding * 2 });
  const rowH = Math.max(20, textH + 10);

  y = checkPage(doc, y, rowH);

  doc.rect(MARGIN, y, cw, rowH).fill(isAlt ? colors.grayUltraLight : colors.white);
  doc.rect(MARGIN, y, cw, rowH).lineWidth(0.3).stroke(colors.border);
  doc.rect(MARGIN, y, labelW, rowH).lineWidth(0.3).stroke(colors.border);

  const textY = y + (rowH - 10) / 2 + 1;
  doc.fontSize(7.5).fill(colors.grayMed).text(label, MARGIN + padding, textY, { width: labelW - padding * 2 });
  doc.fontSize(8).fill(colors.dark).text(value, MARGIN + labelW + padding, y + 5, { width: valueW - padding * 2, lineGap: 2 });

  return y + rowH;
}

function ownerBlock(doc: PDFKit.PDFDocument, y: number, user: User, lote: Lote, modelo: ModeloArquitectonico): number {
  y = sectionTitle(doc, y, "Informacion del Propietario y Lote");
  y = infoRow(doc, y, "Propietario", `${user.nombre} ${user.apellido}`, false);
  y = infoRow(doc, y, "Documento", user.documento, true);
  y = infoRow(doc, y, "Lote", `${lote.codigo} - ${lote.ubicacion}`, false);
  y = infoRow(doc, y, "Area del lote", `${lote.area} m2`, true);
  y = infoRow(doc, y, "Modelo asignado", `${modelo.nombre} (${modelo.area} m2 construidos)`, false);
  return y + 10;
}

function generatePDFBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

function textBlock(doc: PDFKit.PDFDocument, y: number, text: string): number {
  const cw = contentWidth(doc);
  const textH = doc.fontSize(8.5).heightOfString(text, { width: cw, lineGap: 3 });
  y = checkPage(doc, y, textH + 8);
  doc.fontSize(8.5).fill(colors.gray).text(text, MARGIN, y, { width: cw, lineGap: 3, align: "justify" });
  return doc.y + 8;
}

function createDoc(): PDFKit.PDFDocument {
  return new PDFDocument({ size: "LETTER", margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } });
}

let floorPlanBuffer: Buffer | null = null;

function loadFloorPlanImage(): Buffer | null {
  if (floorPlanBuffer) return floorPlanBuffer;
  const possibilities = [
    path.join(process.cwd(), "client", "public", "plano-arquitectonico.png"),
    path.join(process.cwd(), "dist", "public", "plano-arquitectonico.png"),
    path.join(process.cwd(), "public", "plano-arquitectonico.png"),
  ];
  for (const p of possibilities) {
    if (fs.existsSync(p)) {
      floorPlanBuffer = fs.readFileSync(p);
      console.log(`Plano arquitectonico cargado desde: ${p} (${floorPlanBuffer.length} bytes)`);
      return floorPlanBuffer;
    }
  }
  console.warn("plano-arquitectonico.png no encontrado en ninguna ruta");
  return null;
}

export async function generatePlanosArquitectonicos(lote: Lote, user: User): Promise<Buffer> {
  const modelo = determinarModelo(lote.area);
  const doc = createDoc();

  docHeader(doc, "Planos Arquitectonicos", `Modelo "${modelo.nombre}" - Lote ${lote.codigo}`);

  let y = 132;
  y = ownerBlock(doc, y, user, lote, modelo);

  y = sectionTitle(doc, y, "Descripcion General del Modelo");
  y = textBlock(doc, y, modelo.descripcion);
  y = textBlock(doc, y, `El modelo "${modelo.nombre}" contempla una construccion de ${modelo.area} m2 distribuidos en ${modelo.pisos} piso(s), disenado para optimizar el aprovechamiento del terreno disponible de ${lote.area} m2. La distribucion espacial garantiza ventilacion cruzada, iluminacion natural adecuada y circulacion eficiente entre las diferentes zonas de la vivienda.`);

  y = sectionTitle(doc, y, "Distribucion Arquitectonica");
  y = infoRow(doc, y, "Area construida total", `${modelo.area} m2`, false);
  y = infoRow(doc, y, "Numero de pisos", `${modelo.pisos}`, true);
  y = infoRow(doc, y, "Habitaciones", modelo.habitaciones, false);
  y = infoRow(doc, y, "Banos", modelo.banos, true);
  y = infoRow(doc, y, "Zona social", modelo.zonaSocial, false);
  y = infoRow(doc, y, "Cocina", modelo.cocina, true);
  y = infoRow(doc, y, "Garaje / Parqueo", modelo.garaje, false);
  y = infoRow(doc, y, "Caracteristicas adicionales", modelo.extras, true);
  y += 8;

  y = sectionTitle(doc, y, "Especificaciones Tecnicas de Planos");
  y = infoRow(doc, y, "Escala de dibujo", "1:50 para plantas, 1:100 para fachadas", false);
  y = infoRow(doc, y, "Cotas y dimensiones", "Sistema metrico internacional (metros)", true);
  y = infoRow(doc, y, "Planta de cubierta", "Cubierta a dos/cuatro aguas con pendiente del 25%", false);
  y = infoRow(doc, y, "Fachada principal", "Acabado en estuco y pintura vinilica lavable", true);
  y = infoRow(doc, y, "Puertas exteriores", "Puerta principal en madera maciza, puertas servicio en aluminio", false);
  y = infoRow(doc, y, "Ventaneria", "Ventanas corredizas en aluminio con vidrio templado 6mm", true);
  y = infoRow(doc, y, "Pisos", "Ceramica antideslizante en zonas humedas, porcelanato en zonas sociales", false);

  const imgBuf = loadFloorPlanImage();
  if (imgBuf) {
    docFooter(doc);
    doc.addPage();
    y = MARGIN + 10;

    const cw = contentWidth(doc);
    y = sectionTitle(doc, y, `Plano Arquitectonico - Modelo "${modelo.nombre}" (${modelo.area} m2)`);

    const imgW = cw;
    const imgH = Math.round(imgW * 0.75);
    const availH = maxY(doc) - y - 40;
    const finalH = Math.min(imgH, availH);

    doc.rect(MARGIN, y, cw, finalH + 4).lineWidth(0.5).stroke(colors.greenLight);
    doc.image(imgBuf, MARGIN + 2, y + 2, { width: cw - 4, height: finalH });
    y += finalH + 14;

    doc.fontSize(7).fill(colors.grayMed).text(
      `Planta general - Modelo "${modelo.nombre}" | Escala referencial 1:50 | Area construida: ${modelo.area} m2 | ${modelo.pisos} piso(s)`,
      MARGIN, y, { width: cw, align: "center" }
    );
    y += 16;

    doc.fontSize(7).fill(colors.grayMed).text(
      `Distribucion: ${modelo.habitaciones} | ${modelo.banos} | ${modelo.cocina} | ${modelo.garaje}`,
      MARGIN, y, { width: cw, align: "center" }
    );
  }

  docFooter(doc);
  return generatePDFBuffer(doc);
}

export async function generatePlanosEstructurales(lote: Lote, user: User): Promise<Buffer> {
  const modelo = determinarModelo(lote.area);
  const doc = createDoc();

  docHeader(doc, "Planos Estructurales", `Modelo "${modelo.nombre}" - Lote ${lote.codigo}`);

  let y = 132;
  y = ownerBlock(doc, y, user, lote, modelo);

  y = sectionTitle(doc, y, "Sistema Estructural");
  y = textBlock(doc, y, `El sistema estructural del modelo "${modelo.nombre}" esta disenado bajo la Norma Sismo Resistente NSR-10 vigente en Colombia, garantizando la seguridad y estabilidad de la edificacion. Se emplea un sistema porticado en concreto reforzado con mamposteria confinada, apropiado para la zona de amenaza sismica del proyecto TerraNova Group.`);

  y = sectionTitle(doc, y, "Cimentacion");
  y = infoRow(doc, y, "Tipo de cimentacion", "Zapatas aisladas en concreto reforzado de 3000 PSI", false);
  y = infoRow(doc, y, "Vigas de amarre", "Vigas de cimentacion 30x30 cm en concreto de 3000 PSI", true);
  y = infoRow(doc, y, "Profundidad desplante", "1.20 metros bajo nivel de terreno natural", false);
  y = infoRow(doc, y, "Capacidad portante", "Segun estudio de suelos del proyecto (min. 1.5 kg/cm2)", true);
  y += 6;

  y = sectionTitle(doc, y, "Elementos Estructurales");
  y = infoRow(doc, y, "Columnas", "Seccion 30x30 cm, refuerzo 4 varillas No.4 + estribos No.3 @ 15cm", false);
  y = infoRow(doc, y, "Vigas principales", "Seccion 30x40 cm, refuerzo longitudinal 4 No.5 + estribos No.3", true);
  y = infoRow(doc, y, "Vigas secundarias", "Seccion 25x30 cm, refuerzo 2 No.4 + estribos No.3 @ 20cm", false);
  y = infoRow(doc, y, "Entrepiso", modelo.pisos > 1 ? "Placa aligerada de 30 cm con casetones de poliestireno" : "No aplica - modelo de un piso", true);
  y = infoRow(doc, y, "Cubierta", "Estructura metalica con correas en perfil C y teja termoacustica", false);
  y = infoRow(doc, y, "Mamposteria", "Bloque No.5 confinado con columnetas y vigas cinta", true);
  y += 6;

  y = sectionTitle(doc, y, "Normas y Especificaciones");
  y = infoRow(doc, y, "Norma sismo resistente", "NSR-10 (Reglamento Colombiano de Construccion)", false);
  y = infoRow(doc, y, "Concreto", "f'c = 3000 PSI (21 MPa) para elementos estructurales", true);
  y = infoRow(doc, y, "Acero de refuerzo", "Fy = 60,000 PSI (420 MPa), barras corrugadas grado 60", false);
  y = infoRow(doc, y, "Recubrimiento minimo", "4 cm en cimentacion, 3 cm en columnas y vigas", true);

  docFooter(doc);
  return generatePDFBuffer(doc);
}

export async function generateDisenoHidraulico(lote: Lote, user: User): Promise<Buffer> {
  const modelo = determinarModelo(lote.area);
  const doc = createDoc();

  docHeader(doc, "Diseno Hidraulico y Sanitario", `Modelo "${modelo.nombre}" - Lote ${lote.codigo}`);

  let y = 132;
  y = ownerBlock(doc, y, user, lote, modelo);

  y = sectionTitle(doc, y, "Red de Agua Potable");
  y = textBlock(doc, y, `El sistema de abastecimiento de agua potable del modelo "${modelo.nombre}" se disena conforme a la NTC 1500 (Codigo Colombiano de Fontaneria) y el RAS 2000 (Reglamento Tecnico del Sector de Agua Potable). La red interna garantiza presion adecuada en todos los puntos de suministro.`);

  y = infoRow(doc, y, "Acometida principal", 'Tuberia PVC presion 1" desde red publica', false);
  y = infoRow(doc, y, "Distribucion interna", 'Tuberia CPVC 1/2" y 3/4" para agua fria y caliente', true);
  y = infoRow(doc, y, "Medidor", 'Medidor volumetrico 1/2" en caja prefabricada con registro', false);
  y = infoRow(doc, y, "Puntos hidraulicos", `${modelo.pisos > 1 ? "12-16" : "8-10"} puntos (lavamanos, duchas, lavaplatos, lavadero)`, true);
  y = infoRow(doc, y, "Calentador", "Prevision para calentador de paso a gas o electrico", false);
  y += 6;

  y = sectionTitle(doc, y, "Red Sanitaria y Aguas Residuales");
  y = infoRow(doc, y, "Desagues sanitarios", 'Tuberia PVC sanitaria 2" y 4" con pendiente minima 2%', false);
  y = infoRow(doc, y, "Bajantes sanitarias", modelo.pisos > 1 ? 'Bajante PVC 4" desde segundo piso' : "No aplica - modelo de un piso", true);
  y = infoRow(doc, y, "Cajas de inspeccion", "Cajas en concreto 60x60 cm con tapa removible", false);
  y = infoRow(doc, y, "Trampa de grasas", "Trampa prefabricada en la salida de cocina", true);
  y = infoRow(doc, y, "Conexion alcantarillado", "Empalme a red de alcantarillado del urbanismo", false);
  y += 6;

  y = sectionTitle(doc, y, "Red de Aguas Lluvias");
  y = infoRow(doc, y, "Canales y bajantes", 'Canal PVC semicircular, bajantes PVC 3"', false);
  y = infoRow(doc, y, "Cajas de recoleccion", "Cajas pluviales independientes del sistema sanitario", true);
  y = infoRow(doc, y, "Disposicion final", "Conexion a red de aguas lluvias del urbanismo", false);

  docFooter(doc);
  return generatePDFBuffer(doc);
}

export async function generateDisenoElectrico(lote: Lote, user: User): Promise<Buffer> {
  const modelo = determinarModelo(lote.area);
  const doc = createDoc();

  docHeader(doc, "Diseno Electrico", `Modelo "${modelo.nombre}" - Lote ${lote.codigo}`);

  let y = 132;
  y = ownerBlock(doc, y, user, lote, modelo);

  y = sectionTitle(doc, y, "Especificaciones Generales");
  y = textBlock(doc, y, `El diseno electrico del modelo "${modelo.nombre}" cumple con el RETIE (Reglamento Tecnico de Instalaciones Electricas) y la NTC 2050 vigentes en Colombia. La instalacion contempla circuitos ramales independientes, sistema de puesta a tierra y proteccion contra sobretensiones.`);

  y = sectionTitle(doc, y, "Acometida y Tablero Principal");
  y = infoRow(doc, y, "Tipo de acometida", "Monofasica 120/240V para modelo residencial", false);
  y = infoRow(doc, y, "Capacidad del tablero", `Tablero de ${modelo.area >= 150 ? "18" : modelo.area >= 120 ? "12" : "8"} circuitos con totalizador`, true);
  y = infoRow(doc, y, "Proteccion principal", "Breaker totalizador 2x40A (ajustable segun carga)", false);
  y = infoRow(doc, y, "Medidor", "Medidor electronico monofasico en caja normalizada", true);
  y = infoRow(doc, y, "Puesta a tierra", 'Varilla copperweld 5/8" x 2.4m con conector certificado', false);
  y += 6;

  y = sectionTitle(doc, y, "Circuitos Ramales");
  y = infoRow(doc, y, "Iluminacion", `${modelo.pisos > 1 ? "2-3 circuitos" : "1-2 circuitos"}, cable calibre 14 AWG THHN`, false);
  y = infoRow(doc, y, "Tomas corriente", `${modelo.pisos > 1 ? "3-4 circuitos" : "2-3 circuitos"}, cable calibre 12 AWG THHN`, true);
  y = infoRow(doc, y, "Cocina", "Circuito independiente calibre 10 AWG para electrodomesticos", false);
  y = infoRow(doc, y, "Calentador", "Circuito dedicado calibre 10 AWG con proteccion GFCI", true);
  y = infoRow(doc, y, "Lavadora", "Circuito independiente calibre 12 AWG con toma GFCI", false);
  y = infoRow(doc, y, "Puntos totales", `Aprox. ${modelo.area >= 150 ? "45-55" : modelo.area >= 120 ? "35-40" : "20-28"} puntos (iluminacion + tomas + especiales)`, true);
  y += 6;

  y = sectionTitle(doc, y, "Sistemas Complementarios");
  y = infoRow(doc, y, "Telecomunicaciones", "Prevision de ductos para TV, internet y telefonia", false);
  y = infoRow(doc, y, "Citofonia", "Prevision de tuberia para sistema de citofonia", true);
  y = infoRow(doc, y, "Gas domiciliario", "Prevision de tuberia para red de gas", false);
  y = infoRow(doc, y, "DPS", "Dispositivo de proteccion contra sobretensiones tipo 2", true);

  docFooter(doc);
  return generatePDFBuffer(doc);
}

export async function generateAprobacionLicencia(lote: Lote, user: User): Promise<Buffer> {
  const modelo = determinarModelo(lote.area);
  const doc = createDoc();

  docHeader(doc, "Licencia de Construccion", `Modelo "${modelo.nombre}" - Lote ${lote.codigo}`);

  let y = 132;
  y = ownerBlock(doc, y, user, lote, modelo);

  y = sectionTitle(doc, y, "Resolucion de Aprobacion");
  y = textBlock(doc, y, `Por medio del presente documento, la Curaduria Urbana correspondiente, en ejercicio de las funciones asignadas por el Decreto 1203 de 2017 y la Ley 388 de 1997, APRUEBA la solicitud de Licencia de Construccion para la edificacion de vivienda unifamiliar sobre el lote ${lote.codigo}, ubicado en ${lote.ubicacion}, dentro del proyecto urbanistico TerraNova Group.`);

  y = sectionTitle(doc, y, "Datos de la Licencia");
  y = infoRow(doc, y, "No. radicacion", `LC-${new Date().getFullYear()}-${String(lote.id).padStart(4, "0")}`, false);
  y = infoRow(doc, y, "Modalidad", "Construccion de obra nueva - Vivienda unifamiliar", true);
  y = infoRow(doc, y, "Titular", `${user.nombre} ${user.apellido} - C.C. ${user.documento}`, false);
  y = infoRow(doc, y, "Predio", `Lote ${lote.codigo} - ${lote.ubicacion}`, true);
  y = infoRow(doc, y, "Area del lote", `${lote.area} m2`, false);
  y = infoRow(doc, y, "Area a construir", `${modelo.area} m2 (Modelo "${modelo.nombre}")`, true);
  y = infoRow(doc, y, "Numero de pisos", `${modelo.pisos}`, false);
  y = infoRow(doc, y, "Uso del suelo", "Residencial - Vivienda Unifamiliar", true);
  y = infoRow(doc, y, "Indice de ocupacion", `${Math.round((modelo.area / modelo.pisos / lote.area) * 100)}% (maximo permitido: 70%)`, false);
  y = infoRow(doc, y, "Vigencia", "24 meses a partir de la fecha de expedicion", true);
  y += 6;

  y = sectionTitle(doc, y, "Documentos Soporte Verificados");
  const documentos = [
    "Escritura publica del predio o certificado de tradicion y libertad",
    "Planos arquitectonicos aprobados por profesional matriculado",
    "Planos estructurales con memorial de calculo (NSR-10)",
    "Diseno de redes hidraulicas y sanitarias",
    "Diseno de instalaciones electricas (RETIE)",
    "Estudio de suelos del proyecto",
    "Poliza de responsabilidad civil del constructor",
  ];

  for (let i = 0; i < documentos.length; i++) {
    y = infoRow(doc, y, `Documento ${i + 1}`, documentos[i], i % 2 === 0);
  }
  y += 6;

  y = sectionTitle(doc, y, "Observaciones");
  y = textBlock(doc, y, "La presente licencia autoriza exclusivamente la construccion del modelo arquitectonico aprobado. Cualquier modificacion al diseno original debera ser tramitada como modificacion de licencia ante la Curaduria correspondiente.");
  y = textBlock(doc, y, "NOTA: Este documento tiene fines academicos dentro del marco del proyecto ADSO-19 y no constituye un documento oficial de licencia urbanistica.");

  docFooter(doc);
  return generatePDFBuffer(doc);
}

export async function generateAllTechnicalDocs(lote: Lote, user: User): Promise<Array<{ content: string; name: string }>> {
  const modelo = determinarModelo(lote.area);
  const prefix = `${lote.codigo}_${modelo.nombre.replace(/\s/g, "_")}`;

  const [arquitectonicos, estructurales, hidraulico, electrico, licencia] = await Promise.all([
    generatePlanosArquitectonicos(lote, user),
    generatePlanosEstructurales(lote, user),
    generateDisenoHidraulico(lote, user),
    generateDisenoElectrico(lote, user),
    generateAprobacionLicencia(lote, user),
  ]);

  return [
    { content: arquitectonicos.toString("base64"), name: `Planos_Arquitectonicos_${prefix}.pdf` },
    { content: estructurales.toString("base64"), name: `Planos_Estructurales_${prefix}.pdf` },
    { content: hidraulico.toString("base64"), name: `Diseno_Hidraulico_Sanitario_${prefix}.pdf` },
    { content: electrico.toString("base64"), name: `Diseno_Electrico_${prefix}.pdf` },
    { content: licencia.toString("base64"), name: `Licencia_Construccion_${prefix}.pdf` },
  ];
}
