import PDFDocument from "pdfkit";
import type { Pago, Venta, Lote, User } from "@shared/schema";
import { generateAllTechnicalDocs, determinarModelo } from "./technical-docs";

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(num);
}

function formatDate(date: Date | null): string {
  if (!date) return new Date().toLocaleDateString("es-CO");
  return new Date(date).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
}

const colors = {
  green: "#1B3C34",
  greenLight: "#2C5346",
  greenMid: "#3A7D6A",
  greenPale: "#E8F0ED",
  greenSoft: "#D4E5DE",
  gold: "#8B6914",
  goldLight: "#C9A84C",
  goldPale: "#F7F0DC",
  cream: "#FAF8F3",
  red: "#7A1A1A",
  redLight: "#B92626",
  redMid: "#D44444",
  redPale: "#FDF0F0",
  redSoft: "#F8DADA",
  dark: "#1A1A1A",
  gray: "#4A4A4A",
  grayMed: "#888888",
  grayLight: "#C0C0C0",
  grayUltraLight: "#F2F2F2",
  border: "#E2DDD5",
  white: "#FFFFFF",
};

function drawDecorativeBorder(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, color: string) {
  doc.rect(x, y, w, h).lineWidth(1.5).stroke(color);
  const corner = 6;
  doc.rect(x - 1, y - 1, corner, corner).fill(color);
  doc.rect(x + w - corner + 1, y - 1, corner, corner).fill(color);
  doc.rect(x - 1, y + h - corner + 1, corner, corner).fill(color);
  doc.rect(x + w - corner + 1, y + h - corner + 1, corner, corner).fill(color);
}

function drawTableRow(doc: PDFKit.PDFDocument, y: number, label: string, value: string, w: number, isAlt: boolean, accentColor: string, isHeader = false) {
  const x = 40;
  const labelW = Math.round(w * 0.35);
  const valueW = w - labelW;
  const pad = 10;

  if (isHeader) {
    const rowH = 24;
    doc.rect(x, y, w, rowH).fill(accentColor);
    doc.fontSize(8).fill(colors.white).text(label.toUpperCase(), x + pad, y + 7, { width: labelW - pad * 2, characterSpacing: 1 });
    doc.fontSize(8).fill(colors.white).text(value.toUpperCase(), x + labelW + pad, y + 7, { width: valueW - pad * 2, characterSpacing: 1 });
    return y + rowH;
  } else {
    const textH = doc.fontSize(8.5).heightOfString(value, { width: valueW - pad * 2 });
    const rowH = Math.max(22, textH + 10);
    doc.rect(x, y, w, rowH).fill(isAlt ? colors.grayUltraLight : colors.white);
    doc.rect(x, y, w, rowH).lineWidth(0.3).stroke(colors.border);
    doc.rect(x, y, labelW, rowH).lineWidth(0.3).stroke(colors.border);
    const textY = y + (rowH - 10) / 2 + 1;
    doc.fontSize(8).fill(colors.grayMed).text(label, x + pad, textY, { width: labelW - pad * 2 });
    doc.fontSize(8.5).fill(colors.dark).text(value, x + labelW + pad, y + 5, { width: valueW - pad * 2, lineGap: 2 });
    return y + rowH;
  }
}

function pdfLuxuryHeader(doc: PDFKit.PDFDocument, bgColor: string, accentColor: string, title: string, subtitle: string) {
  const w = doc.page.width;
  const m = 40;
  const cw = w - m * 2;

  doc.rect(0, 0, w, 135).fill(bgColor);

  doc.rect(m - 10, 12, cw + 20, 111).lineWidth(0.5).stroke(accentColor);
  doc.rect(m - 7, 15, cw + 14, 105).lineWidth(0.3).stroke(accentColor);

  doc.fontSize(7).fill(accentColor).text("SISTEMA INMOBILIARIO", m, 26, { width: cw, align: "center", characterSpacing: 4 });
  doc.fontSize(22).fill(colors.white).text("TERRANOVA GROUP", m, 40, { width: cw, align: "center", characterSpacing: 6 });

  const lineY = 68;
  const cx = w / 2;
  doc.moveTo(cx - 80, lineY).lineTo(cx - 10, lineY).lineWidth(0.5).stroke(accentColor);
  doc.moveTo(cx + 10, lineY).lineTo(cx + 80, lineY).lineWidth(0.5).stroke(accentColor);
  doc.fontSize(5).fill(accentColor).text("TN", m, lineY - 3, { width: cw, align: "center" });

  doc.fontSize(12).fill(colors.white).text(title.toUpperCase(), m, 78, { width: cw, align: "center", characterSpacing: 2 });
  doc.fontSize(8).fill(accentColor).text(subtitle, m, 98, { width: cw, align: "center" });

  doc.rect(0, 135, w, 2.5).fill(accentColor);
}

function pdfLuxuryFooter(doc: PDFKit.PDFDocument) {
  const w = doc.page.width;
  const m = 40;
  const cw = w - m * 2;
  const y = doc.page.height - 55;

  doc.rect(0, y, w, 55).fill(colors.green);
  doc.rect(0, y, w, 1.5).fill(colors.goldLight);

  doc.fontSize(6.5).fill(colors.grayLight).text(
    "Documento generado por TerraNova Group. Para consultas, use el modulo PQRS.",
    m, y + 10, { width: cw, align: "center" }
  );
  doc.fontSize(6.5).fill(colors.goldLight).text(
    `(C) ${new Date().getFullYear()} TerraNova Group - Todos los derechos reservados`,
    m, y + 24, { width: cw, align: "center" }
  );
}

function pdfSectionHeader(doc: PDFKit.PDFDocument, y: number, title: string, accentColor: string, iconChar?: string): number {
  const w = doc.page.width;
  const m = 40;
  const cw = w - m * 2;
  doc.rect(m, y, cw, 20).fill(accentColor);
  const label = iconChar ? `${iconChar}  ${title.toUpperCase()}` : title.toUpperCase();
  doc.fontSize(8.5).fill(colors.white).text(label, m + 12, y + 6, { width: cw - 24, characterSpacing: 1.5 });
  return y + 26;
}

function pdfMetaLine(doc: PDFKit.PDFDocument, y: number, leftText: string, rightText: string): number {
  doc.fontSize(8).fill(colors.grayMed).text(leftText, 55, y);
  doc.fontSize(8).fill(colors.grayMed).text(rightText, 55, y, { align: "right", width: doc.page.width - 110 });
  return y + 16;
}

function generateReceiptPDF(pago: Pago, venta: Venta, lote: Lote, user: User, totalPagado: number, numeroCuota: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const w = doc.page.width;
    const tableW = w - 80;

    pdfLuxuryHeader(doc, colors.green, colors.goldLight, "Comprobante de Pago", "Documento oficial de soporte de transaccion");

    let y = 162;

    y = pdfMetaLine(doc, y, `No. Comprobante: ${String(pago.id).padStart(6, "0")}`, `Fecha de emision: ${formatDate(pago.fecha)}`);
    y += 8;

    y = pdfSectionHeader(doc, y, "Informacion del Cliente", colors.greenLight);
    y = drawTableRow(doc, y, "Campo", "Detalle", tableW, false, colors.greenLight, true);
    y = drawTableRow(doc, y, "Nombre completo", `${user.nombre} ${user.apellido}`, tableW, false, colors.greenLight);
    y = drawTableRow(doc, y, "No. Documento", user.documento, tableW, true, colors.greenLight);
    y = drawTableRow(doc, y, "Correo electronico", user.email, tableW, false, colors.greenLight);
    if (user.telefono) y = drawTableRow(doc, y, "Telefono", user.telefono, tableW, true, colors.greenLight);
    y += 12;

    y = pdfSectionHeader(doc, y, "Informacion del Lote", colors.greenLight);
    y = drawTableRow(doc, y, "Campo", "Detalle", tableW, false, colors.greenLight, true);
    y = drawTableRow(doc, y, "Codigo del lote", lote.codigo, tableW, false, colors.greenLight);
    y = drawTableRow(doc, y, "Ubicacion", lote.ubicacion, tableW, true, colors.greenLight);
    y = drawTableRow(doc, y, "Area del terreno", `${lote.area} m2`, tableW, false, colors.greenLight);
    y = drawTableRow(doc, y, "Etapa del proyecto", lote.etapa, tableW, true, colors.greenLight);
    y += 12;

    y = pdfSectionHeader(doc, y, "Detalle de la Transaccion", colors.gold);
    y = drawTableRow(doc, y, "Campo", "Detalle", tableW, false, colors.gold, true);
    y = drawTableRow(doc, y, "No. de cuota", `${numeroCuota} de ${venta.cuotas}`, tableW, false, colors.gold);
    y = drawTableRow(doc, y, "Concepto del pago", pago.concepto, tableW, true, colors.gold);
    y = drawTableRow(doc, y, "Valor de la cuota", formatCurrency(pago.monto), tableW, false, colors.gold);
    y = drawTableRow(doc, y, "No. de venta", String(venta.id).padStart(6, "0"), tableW, true, colors.gold);

    const estadoY = y;
    doc.rect(40, estadoY, tableW, 26).fill(colors.greenPale);
    doc.rect(40, estadoY, tableW, 26).lineWidth(1).stroke(colors.greenLight);
    doc.fontSize(10).fill(colors.greenLight).text("ESTADO:  APROBADO", 40, estadoY + 7, { width: tableW, align: "center", characterSpacing: 2 });
    y = estadoY + 34;
    y += 8;

    y = pdfSectionHeader(doc, y, "Resumen Financiero", colors.green);

    const saldo = parseFloat(venta.valorTotal) - totalPagado;
    const progreso = Math.min(100, (totalPagado / parseFloat(venta.valorTotal)) * 100);

    const boxH = 80;
    doc.rect(40, y, tableW, boxH).fill(colors.cream);
    drawDecorativeBorder(doc, 40, y, tableW, boxH, colors.greenLight);

    const colW3 = Math.round(tableW / 3);
    doc.fontSize(8).fill(colors.grayMed).text("Valor total del lote", 55, y + 10, { width: colW3 - 20 });
    doc.fontSize(11).fill(colors.dark).text(formatCurrency(venta.valorTotal), 55, y + 22, { width: colW3 - 20 });

    doc.fontSize(8).fill(colors.grayMed).text("Total pagado a la fecha", 40 + colW3, y + 10, { width: colW3 - 10 });
    doc.fontSize(11).fill(colors.greenLight).text(formatCurrency(totalPagado), 40 + colW3, y + 22, { width: colW3 - 10 });

    doc.fontSize(8).fill(colors.grayMed).text("Saldo pendiente", 40 + colW3 * 2, y + 10, { width: colW3 - 10 });
    doc.fontSize(11).fill(saldo > 0 ? colors.redLight : colors.greenLight).text(formatCurrency(saldo), 40 + colW3 * 2, y + 22, { width: colW3 - 10 });

    const barX = 55;
    const barY = y + 48;
    const barW = tableW - 40;
    doc.rect(barX, barY, barW, 10).fill(colors.border);
    doc.rect(barX, barY, barW * (progreso / 100), 10).fill(colors.greenLight);
    doc.rect(barX, barY, barW, 10).lineWidth(0.3).stroke(colors.grayLight);
    doc.fontSize(8).fill(colors.dark).text(`Progreso: ${progreso.toFixed(1)}% completado`, barX, barY + 14);
    doc.fontSize(8).fill(colors.grayMed).text(`${numeroCuota}/${venta.cuotas} cuotas`, barX + barW - 100, barY + 14);

    pdfLuxuryFooter(doc);
    doc.end();
  });
}

function generateRejectionPDF(pago: Pago, venta: Venta, lote: Lote, user: User, motivoRechazo: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const w = doc.page.width;
    const tableW = w - 80;

    pdfLuxuryHeader(doc, colors.red, "#FFB0B0", "Notificacion de Rechazo", "Revision de pago - Accion requerida");

    let y = 162;

    y = pdfMetaLine(doc, y, `Ref. P-${String(pago.id).padStart(6, "0")}`, `Fecha: ${formatDate(pago.fecha)}`);
    y += 4;

    const alertH = 36;
    doc.rect(55, y, tableW, alertH).fill(colors.redPale);
    doc.rect(55, y, tableW, alertH).lineWidth(1).stroke(colors.redLight);
    doc.rect(55, y, 5, alertH).fill(colors.redLight);
    doc.fontSize(10).fill(colors.red).text("ESTADO:  PAGO RECHAZADO", 0, y + 11, { align: "center", width: w, characterSpacing: 2 });
    y += alertH + 14;

    y = pdfSectionHeader(doc, y, "Datos del Cliente", colors.red);
    y = drawTableRow(doc, y, "Campo", "Detalle", tableW, false, colors.red, true);
    y = drawTableRow(doc, y, "Nombre completo", `${user.nombre} ${user.apellido}`, tableW, false, colors.red);
    y = drawTableRow(doc, y, "No. Documento", user.documento, tableW, true, colors.red);
    y = drawTableRow(doc, y, "Correo electronico", user.email, tableW, false, colors.red);
    y += 12;

    y = pdfSectionHeader(doc, y, "Detalle del Pago Rechazado", colors.red);
    y = drawTableRow(doc, y, "Campo", "Detalle", tableW, false, colors.red, true);
    y = drawTableRow(doc, y, "Lote", `${lote.codigo} - ${lote.ubicacion}`, tableW, false, colors.red);
    y = drawTableRow(doc, y, "Area del terreno", `${lote.area} m2`, tableW, true, colors.red);
    y = drawTableRow(doc, y, "Concepto", pago.concepto, tableW, false, colors.red);
    y = drawTableRow(doc, y, "Monto", formatCurrency(pago.monto), tableW, true, colors.red);
    y = drawTableRow(doc, y, "No. Venta", String(venta.id).padStart(6, "0"), tableW, false, colors.red);
    y += 12;

    y = pdfSectionHeader(doc, y, "Motivo del Rechazo", "#991111");
    const motivoBoxH = 80;
    doc.rect(55, y, tableW, motivoBoxH).fill(colors.redPale);
    drawDecorativeBorder(doc, 55, y, tableW, motivoBoxH, colors.redLight);
    doc.rect(55, y, 5, motivoBoxH).fill(colors.redLight);
    doc.fontSize(10).fill(colors.dark).text(motivoRechazo, 75, y + 14, { width: tableW - 50, lineGap: 4 });
    y += motivoBoxH + 14;

    const infoBoxH = 50;
    doc.rect(55, y, tableW, infoBoxH).fill(colors.goldPale);
    drawDecorativeBorder(doc, 55, y, tableW, infoBoxH, colors.goldLight);
    doc.rect(55, y, 5, infoBoxH).fill(colors.goldLight);
    doc.fontSize(8).fill(colors.gold).text("INFORMACION IMPORTANTE", 75, y + 8, { characterSpacing: 1 });
    doc.fontSize(8.5).fill(colors.gray).text(
      "Si considera que este rechazo es un error, puede comunicarse con el equipo administrativo a traves del modulo PQRS disponible en nuestra plataforma web. Su caso sera revisado a la mayor brevedad posible.",
      75, y + 22, { width: tableW - 50, lineGap: 3 }
    );

    pdfLuxuryFooter(doc);
    doc.end();
  });
}

function generateCompletionPDF(venta: Venta, lote: Lote, user: User, totalPagado: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const w = doc.page.width;
    const tableW = w - 80;

    doc.rect(0, 0, w, 170).fill(colors.green);

    doc.rect(25, 10, w - 50, 150).lineWidth(0.5).stroke(colors.goldLight);
    doc.rect(28, 13, w - 56, 144).lineWidth(0.3).stroke(colors.goldLight);

    doc.fontSize(8).fill(colors.goldLight).text("SISTEMA INMOBILIARIO", 0, 25, { align: "center", characterSpacing: 5 });
    doc.fontSize(30).fill(colors.white).text("TERRANOVA GROUP", 0, 40, { align: "center", characterSpacing: 8 });

    const lineY = 78;
    const lineW = 200;
    const cx = w / 2;
    doc.moveTo(cx - lineW / 2, lineY).lineTo(cx - 20, lineY).lineWidth(0.5).stroke(colors.goldLight);
    doc.moveTo(cx + 20, lineY).lineTo(cx + lineW / 2, lineY).lineWidth(0.5).stroke(colors.goldLight);
    doc.fontSize(7).fill(colors.goldLight).text("VR", cx - 5, lineY - 4);

    doc.fontSize(16).fill(colors.white).text("CERTIFICADO DE PAGO TOTAL", 0, 92, { align: "center", characterSpacing: 3 });
    doc.fontSize(9).fill(colors.goldLight).text("Documento oficial de finalizacion de pagos", 0, 116, { align: "center" });
    doc.fontSize(8).fill(colors.goldLight).text(`Venta No. ${String(venta.id).padStart(6, "0")}  |  ${formatDate(new Date())}`, 0, 134, { align: "center" });

    doc.rect(0, 170, w, 4).fill(colors.goldLight);

    let y = 190;

    const recipientH = 65;
    doc.rect(55, y, tableW, recipientH).fill(colors.greenPale);
    drawDecorativeBorder(doc, 55, y, tableW, recipientH, colors.greenLight);
    doc.fontSize(8).fill(colors.greenLight).text("CERTIFICADO OTORGADO A:", 75, y + 10, { characterSpacing: 2 });
    doc.fontSize(18).fill(colors.green).text(`${user.nombre} ${user.apellido}`, 75, y + 26);
    doc.fontSize(8.5).fill(colors.grayMed).text(`Documento: ${user.documento}`, 75, y + 50);
    doc.fontSize(8.5).fill(colors.grayMed).text(`Correo: ${user.email}`, 300, y + 50);
    y += recipientH + 14;

    doc.fontSize(9.5).fill(colors.gray).text(
      "Por medio del presente documento, el proyecto inmobiliario TerraNova Group certifica que el titular arriba mencionado ha completado exitosamente la totalidad de los pagos correspondientes a la adquisicion de su lote, segun el detalle que se presenta a continuacion:",
      55, y, { width: tableW, lineGap: 4 }
    );
    y += 52;

    y = pdfSectionHeader(doc, y, "Detalle del Lote Adquirido", colors.greenLight);
    y = drawTableRow(doc, y, "Campo", "Detalle", tableW, false, colors.greenLight, true);
    y = drawTableRow(doc, y, "Codigo del lote", lote.codigo, tableW, false, colors.greenLight);
    y = drawTableRow(doc, y, "Ubicacion", lote.ubicacion, tableW, true, colors.greenLight);
    y = drawTableRow(doc, y, "Area del terreno", `${lote.area} m2`, tableW, false, colors.greenLight);
    y = drawTableRow(doc, y, "Etapa del proyecto", lote.etapa, tableW, true, colors.greenLight);
    y += 10;

    y = pdfSectionHeader(doc, y, "Resumen Financiero", colors.gold);
    y = drawTableRow(doc, y, "Campo", "Detalle", tableW, false, colors.gold, true);
    y = drawTableRow(doc, y, "Valor total del lote", formatCurrency(venta.valorTotal), tableW, false, colors.gold);
    y = drawTableRow(doc, y, "Total pagado", formatCurrency(totalPagado), tableW, true, colors.gold);
    y = drawTableRow(doc, y, "Plan de cuotas", `${venta.cuotas} cuota(s) completadas`, tableW, false, colors.gold);
    y = drawTableRow(doc, y, "Saldo pendiente", formatCurrency(0), tableW, true, colors.gold);

    const statusH = 30;
    doc.rect(55, y, tableW, statusH).fill(colors.greenLight);
    doc.rect(55, y, tableW, statusH).lineWidth(1).stroke(colors.green);
    doc.fontSize(11).fill(colors.white).text("ESTADO:  PAGADO EN SU TOTALIDAD", 0, y + 9, { align: "center", width: w, characterSpacing: 2 });
    y += statusH + 14;

    y = pdfSectionHeader(doc, y, "Documentos Incluidos con su Lote", colors.greenLight);

    const documentos = [
      "Planos arquitectonicos completos",
      "Planos estructurales",
      "Diseno de redes hidraulicas y sanitarias",
      "Diseno electrico",
      "Aprobacion para licencia de construccion",
      "Asesoria tecnica personalizada",
    ];

    documentos.forEach((item, i) => {
      const rowH = 22;
      const bg = i % 2 === 0 ? colors.greenPale : colors.white;
      doc.rect(55, y, tableW, rowH).fill(bg);
      doc.rect(55, y, tableW, rowH).lineWidth(0.3).stroke(colors.border);
      doc.rect(55, y, 24, rowH).fill(colors.greenLight);
      doc.fontSize(8).fill(colors.white).text(String(i + 1).padStart(2, "0"), 58, y + 7);
      doc.fontSize(9).fill(colors.dark).text(item, 90, y + 6);
      y += rowH;
    });
    y += 10;

    const noteH = 40;
    doc.rect(55, y, tableW, noteH).fill(colors.goldPale);
    drawDecorativeBorder(doc, 55, y, tableW, noteH, colors.goldLight);
    doc.fontSize(7.5).fill(colors.gold).text("NOTA IMPORTANTE", 75, y + 6, { characterSpacing: 1 });
    doc.fontSize(8).fill(colors.gray).text(
      "Los documentos tecnicos seran entregados en las oficinas de TerraNova Group o enviados por correo electronico segun coordinacion previa con el propietario. Nuestro equipo se comunicara para agendar la entrega.",
      75, y + 18, { width: tableW - 50, lineGap: 2 }
    );

    pdfLuxuryFooter(doc);
    doc.end();
  });
}

function emailWrapper(headerBg: string, headerAccent: string, headerTitle: string, headerSubtitle: string, bodyContent: string): string {
  return `
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #F5F3EF; padding: 20px;">
      <div style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        
        <div style="background: linear-gradient(135deg, ${headerBg} 0%, ${headerBg}DD 100%); padding: 40px 30px; text-align: center;">
          <p style="color: ${headerAccent}; margin: 0 0 8px; font-size: 11px; letter-spacing: 4px; text-transform: uppercase;">Sistema Inmobiliario</p>
          <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 3px;">TERRANOVA GROUP</h1>
          <div style="width: 60px; height: 2px; background-color: ${headerAccent}; margin: 16px auto;"></div>
          <h2 style="color: #FFFFFF; margin: 0; font-size: 18px; font-weight: 600;">${headerTitle}</h2>
          ${headerSubtitle ? `<p style="color: ${headerAccent}; margin: 8px 0 0; font-size: 13px;">${headerSubtitle}</p>` : ""}
        </div>

        <div style="padding: 35px 30px; background-color: #FFFFFF;">
          ${bodyContent}
        </div>

        <div style="background-color: ${headerBg}; padding: 20px 30px; text-align: center;">
          <p style="color: ${headerAccent}; margin: 0; font-size: 11px; letter-spacing: 1px;">
            &copy; ${new Date().getFullYear()} TerraNova Group &middot; Todos los derechos reservados
          </p>
        </div>

      </div>
      <p style="text-align: center; color: #999; font-size: 10px; margin-top: 15px;">
        Este correo fue generado automaticamente. No responda a este mensaje.
      </p>
    </div>
  `;
}

function emailInfoTable(rows: { label: string; value: string }[], borderColor: string, bgAlt: string): string {
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 8px; overflow: hidden; border: 1px solid ${borderColor};">
      ${rows.map((row, i) => `
        <tr style="background-color: ${i % 2 === 0 ? bgAlt : "#FFFFFF"};">
          <td style="padding: 12px 16px; font-size: 13px; color: #777; width: 40%; border-bottom: 1px solid ${borderColor};">${row.label}</td>
          <td style="padding: 12px 16px; font-size: 13px; color: #333; font-weight: 600; border-bottom: 1px solid ${borderColor};">${row.value}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

export async function sendPasswordResetEmail(user: User, token: string, baseUrl: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "le.mj0312@gmail.com";
  if (!apiKey) { console.log("Email no configurado: BREVO_API_KEY no definido"); return; }

  const resetLink = `${baseUrl}/restablecer-password?token=${token}`;

  try {
    const body = `
      <p style="font-size: 15px; color: #333; line-height: 1.7;">
        Estimado(a) <strong>${user.nombre} ${user.apellido}</strong>,
      </p>
      <p style="font-size: 14px; color: #555; line-height: 1.7;">
        Hemos recibido una solicitud para restablecer la contrasena asociada a su cuenta en el sistema TerraNova Group.
      </p>

      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetLink}" style="background: linear-gradient(135deg, ${colors.greenLight}, ${colors.green}); color: #FFFFFF; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(44,83,70,0.3);">
          Restablecer Contrasena
        </a>
      </div>

      <div style="background-color: ${colors.cream}; border: 1px solid ${colors.border}; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #888;">Si el boton no funciona, copie y pegue este enlace:</p>
        <p style="margin: 0; font-size: 11px; color: ${colors.greenLight}; word-break: break-all;">${resetLink}</p>
      </div>

      <div style="background-color: #FFF9E6; border-left: 4px solid ${colors.goldLight}; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #666;">
          <strong style="color: ${colors.gold};">Importante:</strong> Este enlace expira en <strong>1 hora</strong>. Si usted no solicito este cambio, ignore este correo de forma segura.
        </p>
      </div>
    `;

    const htmlContent = emailWrapper(colors.green, colors.goldLight, "Restablecer Contrasena", "Solicitud de cambio de clave", body);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "content-type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        sender: { name: "TerraNova Group", email: senderEmail },
        to: [{ email: user.email, name: `${user.nombre} ${user.apellido}` }],
        subject: "Restablecer Contrasena - TerraNova Group",
        htmlContent,
      }),
    });
    const result = await response.json();
    if (response.ok) { console.log(`Email de restablecimiento enviado a ${user.email}`); }
    else { console.error("Error de Brevo:", result); }
  } catch (error) { console.error("Error al enviar email de restablecimiento:", error); }
}

export async function sendPaymentRejection(pago: Pago, venta: Venta, lote: Lote, user: User, motivoRechazo: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "le.mj0312@gmail.com";
  if (!apiKey) { console.log("Email no configurado: BREVO_API_KEY no definido"); return; }

  try {
    const pdfBuffer = await generateRejectionPDF(pago, venta, lote, user, motivoRechazo);

    const body = `
      <p style="font-size: 15px; color: #333; line-height: 1.7;">
        Estimado(a) <strong>${user.nombre} ${user.apellido}</strong>,
      </p>
      <p style="font-size: 14px; color: #555; line-height: 1.7;">
        Le informamos que su pago ha sido <strong style="color: ${colors.redLight};">rechazado</strong> por el administrador del sistema.
      </p>

      ${emailInfoTable([
        { label: "Lote", value: `${lote.codigo} - ${lote.ubicacion}` },
        { label: "Monto", value: formatCurrency(pago.monto) },
        { label: "Concepto", value: pago.concepto },
        { label: "Fecha", value: formatDate(pago.fecha) },
        { label: "Estado", value: "RECHAZADO" },
      ], "#E8C0C0", colors.redPale)}

      <div style="background-color: ${colors.redPale}; border-left: 4px solid ${colors.redLight}; border-radius: 0 8px 8px 0; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: ${colors.red}; text-transform: uppercase; letter-spacing: 1px;">Motivo del rechazo</p>
        <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${motivoRechazo}</p>
      </div>

      <div style="background-color: ${colors.cream}; border: 1px solid ${colors.border}; border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #666;">
          Si considera que este rechazo es un error, por favor comuniquese a traves del <strong>modulo PQRS</strong> en nuestra plataforma. Adjunto encontrara el detalle completo en formato PDF.
        </p>
      </div>
    `;

    const htmlContent = emailWrapper(colors.red, "#FFB0B0", "Pago Rechazado", `Lote ${lote.codigo} - Ref. P-${String(pago.id).padStart(6, "0")}`, body);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "content-type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        sender: { name: "TerraNova Group", email: senderEmail },
        to: [{ email: user.email, name: `${user.nombre} ${user.apellido}` }],
        subject: `Pago Rechazado - Lote ${lote.codigo} - TerraNova Group`,
        htmlContent,
        attachment: [{ content: pdfBuffer.toString("base64"), name: `pago_rechazado_${String(pago.id).padStart(6, "0")}.pdf` }],
      }),
    });
    const result = await response.json();
    if (response.ok) { console.log(`Notificacion de rechazo enviada a ${user.email} para pago #${pago.id}`); }
    else { console.error("Error de Brevo:", result); }
  } catch (error) { console.error("Error al enviar notificacion de rechazo:", error); }
}

export async function sendPaymentReceipt(pago: Pago, venta: Venta, lote: Lote, user: User, totalPagado: number, numeroCuota: number): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "le.mj0312@gmail.com";
  if (!apiKey) { console.log("Email no configurado: BREVO_API_KEY no definido"); return; }

  try {
    const pdfBuffer = await generateReceiptPDF(pago, venta, lote, user, totalPagado, numeroCuota);
    const saldo = parseFloat(venta.valorTotal) - totalPagado;
    const progreso = Math.min(100, (totalPagado / parseFloat(venta.valorTotal)) * 100);

    const body = `
      <p style="font-size: 15px; color: #333; line-height: 1.7;">
        Estimado(a) <strong>${user.nombre} ${user.apellido}</strong>,
      </p>
      <p style="font-size: 14px; color: #555; line-height: 1.7;">
        Su pago ha sido <strong style="color: ${colors.greenLight};">aprobado</strong> exitosamente. A continuacion el resumen de su transaccion:
      </p>

      ${emailInfoTable([
        { label: "Lote", value: `${lote.codigo} - ${lote.ubicacion}` },
        { label: "Cuota", value: `${numeroCuota} de ${venta.cuotas}` },
        { label: "Concepto", value: pago.concepto },
        { label: "Monto pagado", value: formatCurrency(pago.monto) },
        { label: "Fecha", value: formatDate(pago.fecha) },
        { label: "Estado", value: "APROBADO" },
      ], colors.border, colors.greenPale)}

      <div style="background-color: ${colors.greenPale}; border: 1px solid ${colors.greenLight}; border-radius: 10px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="font-size: 13px; color: #666;">Total pagado:</td>
            <td style="font-size: 15px; font-weight: 700; color: ${colors.green}; text-align: right;">${formatCurrency(totalPagado)}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #666;">Saldo pendiente:</td>
            <td style="font-size: 15px; font-weight: 700; color: ${saldo > 0 ? colors.redLight : colors.greenLight}; text-align: right;">${formatCurrency(saldo)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top: 12px;">
              <div style="background-color: #D0D0D0; border-radius: 10px; height: 12px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, ${colors.greenLight}, ${colors.green}); height: 100%; width: ${progreso}%; border-radius: 10px;"></div>
              </div>
              <p style="text-align: center; font-size: 11px; color: #888; margin: 6px 0 0;">${progreso.toFixed(0)}% completado</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background-color: ${colors.cream}; border: 1px solid ${colors.border}; border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #666;">
          Adjunto encontrara su comprobante de pago en formato PDF. Para cualquier consulta, utilice el <strong>modulo PQRS</strong> en nuestra plataforma.
        </p>
      </div>
    `;

    const htmlContent = emailWrapper(colors.green, colors.goldLight, "Comprobante de Pago", `Lote ${lote.codigo} - Cuota ${numeroCuota}/${venta.cuotas}`, body);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "content-type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        sender: { name: "TerraNova Group", email: senderEmail },
        to: [{ email: user.email, name: `${user.nombre} ${user.apellido}` }],
        subject: `Comprobante de Pago - Lote ${lote.codigo} - Cuota ${numeroCuota} - TerraNova Group`,
        htmlContent,
        attachment: [{ content: pdfBuffer.toString("base64"), name: `comprobante_pago_${String(pago.id).padStart(6, "0")}.pdf` }],
      }),
    });
    const result = await response.json();
    if (response.ok) { console.log(`Comprobante enviado a ${user.email} para pago #${pago.id}`); }
    else { console.error("Error de Brevo:", result); }
  } catch (error) { console.error("Error al enviar comprobante por correo:", error); }
}

export async function sendCompletionCongratulations(venta: Venta, lote: Lote, user: User, totalPagado: number): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "le.mj0312@gmail.com";
  if (!apiKey) { console.log("Email no configurado: BREVO_API_KEY no definido"); return; }

  try {
    const modelo = determinarModelo(lote.area);

    const [pdfBuffer, technicalDocs] = await Promise.all([
      generateCompletionPDF(venta, lote, user, totalPagado),
      generateAllTechnicalDocs(lote, user),
    ]);

    const documentosList = [
      `Planos arquitectonicos completos - Modelo "${modelo.nombre}"`,
      `Planos estructurales - Modelo "${modelo.nombre}"`,
      `Diseno de redes hidraulicas y sanitarias - Modelo "${modelo.nombre}"`,
      `Diseno electrico - Modelo "${modelo.nombre}"`,
      `Aprobacion para licencia de construccion - Modelo "${modelo.nombre}"`,
    ];

    const body = `
      <div style="text-align: center; margin-bottom: 25px;">
        <p style="font-size: 42px; margin: 0;">&#127881;</p>
        <h2 style="color: ${colors.green}; margin: 10px 0 5px; font-size: 22px;">Felicitaciones, ${user.nombre}!</h2>
        <p style="color: #666; font-size: 14px; margin: 0;">Has completado el pago total de tu lote</p>
      </div>

      <p style="font-size: 14px; color: #555; line-height: 1.7;">
        Nos complace informarte que has completado exitosamente la <strong style="color: ${colors.green};">totalidad de los pagos</strong> 
        correspondientes a tu lote <strong>${lote.codigo}</strong> en el proyecto TerraNova Group.
      </p>

      <div style="background: linear-gradient(135deg, ${colors.greenPale}, #FFFFFF); border: 2px solid ${colors.greenLight}; border-radius: 12px; padding: 24px; margin: 25px 0;">
        <h3 style="color: ${colors.green}; margin: 0 0 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Resumen de tu inversion</h3>
        ${emailInfoTable([
          { label: "Lote", value: `${lote.codigo} - ${lote.ubicacion}` },
          { label: "Area", value: `${lote.area} m2` },
          { label: "Valor total", value: formatCurrency(venta.valorTotal) },
          { label: "Cuotas completadas", value: `${venta.cuotas} de ${venta.cuotas}` },
        ], colors.border, colors.greenPale)}
        <div style="background-color: ${colors.green}; border-radius: 8px; padding: 12px; text-align: center;">
          <span style="color: ${colors.white}; font-size: 14px; font-weight: 600; letter-spacing: 1px;">PAGADO EN SU TOTALIDAD</span>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #F0F7F4, #FFFFFF); border: 2px solid ${colors.greenMid}; border-radius: 12px; padding: 24px; margin: 25px 0;">
        <h3 style="color: ${colors.green}; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">&#127968; Modelo arquitectonico asignado</h3>
        <p style="font-size: 22px; font-weight: 700; color: ${colors.green}; margin: 0 0 6px;">"${modelo.nombre}"</p>
        <p style="font-size: 13px; color: #666; margin: 0;">Area construida: <strong>${modelo.area} m2</strong> &bull; ${modelo.pisos} piso(s) &bull; ${modelo.habitaciones}</p>
      </div>

      <h3 style="color: ${colors.green}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">&#128206; Documentos tecnicos adjuntos (${documentosList.length} PDFs)</h3>
      <div style="background-color: #FFFFFF; border: 1px solid ${colors.border}; border-radius: 10px; overflow: hidden;">
        ${documentosList.map((item, i) => `
          <div style="padding: 12px 16px; border-bottom: 1px solid ${colors.border}; background-color: ${i % 2 === 0 ? colors.cream : "#FFFFFF"}; display: flex; align-items: center;">
            <span style="color: ${colors.greenLight}; font-size: 14px; margin-right: 10px;">&#128196;</span>
            <span style="font-size: 13px; color: #444;">${item}</span>
          </div>
        `).join("")}
      </div>

      <div style="background-color: #FFF9E6; border-left: 4px solid ${colors.goldLight}; border-radius: 0 8px 8px 0; padding: 16px; margin: 25px 0;">
        <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: ${colors.gold}; text-transform: uppercase; letter-spacing: 1px;">Proximos pasos</p>
        <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">
          Revisa los documentos tecnicos adjuntos correspondientes al modelo <strong>"${modelo.nombre}"</strong>. 
          Nuestro equipo se comunicara contigo para coordinar la asesoria personalizada para la construccion de tu vivienda.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0 10px;">
        <p style="font-size: 16px; font-weight: 600; color: ${colors.green};">Bienvenido a la familia TerraNova Group!</p>
      </div>
    `;

    const htmlContent = emailWrapper(colors.green, colors.goldLight, "Pago Total Completado", `Lote ${lote.codigo} - ${lote.ubicacion}`, body);

    const attachments = [
      { content: pdfBuffer.toString("base64"), name: `certificado_pago_total_lote_${lote.codigo}.pdf` },
      ...technicalDocs,
    ];

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "content-type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        sender: { name: "TerraNova Group", email: senderEmail },
        to: [{ email: user.email, name: `${user.nombre} ${user.apellido}` }],
        subject: `Felicitaciones! Pago Total Completado - Lote ${lote.codigo} - Modelo ${modelo.nombre} - TerraNova Group`,
        htmlContent,
        attachment: attachments,
      }),
    });
    const result = await response.json();
    if (response.ok) { console.log(`Correo de felicitaciones con ${attachments.length} documentos enviado a ${user.email} (Modelo: ${modelo.nombre})`); }
    else { console.error("Error de Brevo:", result); }
  } catch (error) { console.error("Error al enviar correo de felicitaciones:", error); }
}
