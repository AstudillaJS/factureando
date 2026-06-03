import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = async (invoiceData: any, configData: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Datos base
  const razonSocial = configData.razonSocial || "Nombre de Empresa";
  const cuit = configData.afipCuit || "00-00000000-0";
  const ptoVta = (invoiceData.ptoVta || configData.afipPtoVta || "1").toString().padStart(5, '0');
  const cbteNro = (invoiceData.voucherNumber || "0").toString().padStart(8, '0');
  const fechaEmi = invoiceData.date || new Date().toISOString().split('T')[0];
  const total = invoiceData.amount || 0;

  // Recuadro Principal (Cabecera)
  doc.rect(10, 10, 190, 45);
  doc.line(105, 10, 105, 55);
  
  // Tipo de Factura (C)
  doc.rect(95, 10, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("C", 100, 25);
  doc.setFontSize(8);
  doc.text("Cod. 11", 99, 33);

  // Logo o Nombre (Izquierda)
  doc.setFontSize(16);
  doc.text(razonSocial.toUpperCase(), 15, 25);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Razón Social: ${razonSocial}`, 15, 35);
  doc.text(`Domicilio Comercial: Centro`, 15, 40);
  doc.text(`Condición frente al IVA: Monotributista`, 15, 45);

  // Lado Derecho
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURA C", 150, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Punto de Venta: ${ptoVta} Comp. Nro: ${cbteNro}`, 110, 30);
  doc.text(`Fecha de Emisión: ${fechaEmi}`, 110, 38);
  doc.text(`CUIT: ${cuit}`, 110, 43);
  doc.text(`Ingresos Brutos: ${cuit}`, 110, 48);

  // Datos del Receptor
  doc.rect(10, 60, 190, 25);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL RECEPTOR", 12, 65);
  doc.line(10, 68, 200, 68);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`CUIT/DNI: ${invoiceData.clientCuit || '0'}`, 15, 75);
  doc.text(`Nombre/Razón Social: ${invoiceData.clientName || 'CONSUMIDOR FINAL'}`, 15, 80);
  doc.text(`Condición IVA: Consumidor Final`, 110, 75);

  // Items
  autoTable(doc, {
    startY: 90,
    head: [['Cod.', 'Descripción / Producto / Servicio', 'Total']],
    body: [
      ['1', invoiceData.description || 'Servicios', `$ ${total.toLocaleString('es-AR')}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 }
  });

  // Totales
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.rect(120, finalY, 80, 25);
  doc.setFont("helvetica", "normal");
  doc.text("Importe Neto No Gravado: $ 0.00", 125, finalY + 7);
  doc.text("Importe Exento: $ 0.00", 125, finalY + 13);
  doc.line(120, finalY + 16, 200, finalY + 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`TOTAL: $ ${total.toLocaleString('es-AR')}`, 125, finalY + 22);

  // Footer (CAE y QR)
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  if (invoiceData.cae) {
    doc.text(`CAE: ${invoiceData.cae}`, 150, pageHeight - 35);
    doc.text(`Fecha Vto. CAE: ${invoiceData.caeVto}`, 150, pageHeight - 30);
  }

  // Leyenda LYNX CONSULTING
  doc.setDrawColor(200);
  doc.line(10, pageHeight - 20, 200, pageHeight - 20);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Comprobante Autorizado por AFIP (ARCA)", 15, pageHeight - 12);
  doc.text("Este PDF ha sido generado por LYNX_OS v2.7", 15, pageHeight - 8);
  
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text("Powered by LYNX CONSULTING", 140, pageHeight - 10);

  // Return as Blob URL for preview/download
  return doc.output('bloburl');
};
