import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SaleItem } from "../types/sales";

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

interface TicketData {
  clientName: string;
  items: SaleItem[];
  paymentMethod: string;
  total: number;
}

const tienda = "Santeria - Oro Verde";

export const generateSaleTicket = (data: TicketData) => {
  const doc = new jsPDF({
    unit: "mm",
    format: [80, 150],
  }) as jsPDFWithAutoTable;

  const { clientName, items, paymentMethod, total } = data;

  // CORRECCIÓN: Fecha sin segundos
  const date = new Date().toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Esto elimina el AM/PM y fuerza 00-23hs
  });

  doc.setFontSize(12);
  doc.text(`${tienda}`, 40, 10, { align: "center" });

  doc.setFontSize(8);
  doc.text(`Fecha: ${date}`, 5, 18);
  doc.text(`Cliente: ${clientName || "Consumidor Final"}`, 5, 22);
  doc.text(`Pago: ${paymentMethod}`, 5, 26);

  autoTable(doc, {
    startY: 30,
    margin: { left: 2, right: 2 },
    theme: "plain",
    styles: { fontSize: 7, cellPadding: 1 },
    head: [["Prod", "Cant", "Subt"]],
    body: items.map((item) => [
      item.title,
      item.units,
      `$${(item.units * item.unit_price).toLocaleString()}`,
    ]),
  });

  const finalY = doc.lastAutoTable.finalY + 5;

  doc.setFontSize(10);
  doc.text(`TOTAL: $${total.toLocaleString()}`, 75, finalY, { align: "right" });

  doc.setFontSize(8);
  doc.text("¡Gracias por su colaboración!", 40, finalY + 10, {
    align: "center",
  });

  doc.save(`Ticket_${Date.now()}.pdf`);
};
