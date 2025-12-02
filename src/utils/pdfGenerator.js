import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import html2canvas from 'html2canvas';

// Asegúrate de que generatePDFFromHTML y generatePDFFromData estén definidas si las usas
// (Las mantengo para que el archivo sea funcional si las llamas desde Requests.jsx)

/**
 * Genera un PDF capturando visualmente un elemento HTML.
 * @param {string} elementId - ID del elemento HTML a convertir
 * @param {string} filename - Nombre del archivo PDF
 * @param {Object} options - Opciones adicionales para html2canvas
 */
export const generatePDFFromHTML = async (elementId, filename = 'documento.pdf', options = {}) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Elemento con ID "${elementId}" no encontrado`);
        }

        // Configuración por defecto optimizada
        const defaultOptions = {
            scale: 2, // Mejor calidad
            useCORS: true,
            logging: false,
            width: element.scrollWidth,
            height: element.scrollHeight,
            ...options // Permite sobreescribir si es necesario
        };

        const canvas = await html2canvas(element, defaultOptions);
        const imgData = canvas.toDataURL('image/png');

        const imgWidth = 210; // A4 mm
        const pageHeight = 297; // A4 mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Forzar descarga del PDF
        pdf.save(filename);
        
    } catch (error) {
        console.error('Error al generar PDF (HTML):', error);
        throw error;
    }
};

/**
 * Genera un PDF con diseño tabular y datos estructurados (Reporte General).
 * @param {string} title - Título del documento.
 * @param {string[]} columns - Array de nombres de columnas.
 * @param {any[][]} data - Array de arrays con los datos de cada fila.
 * @param {string} filename - Nombre del archivo a descargar.
 */
export const generatePDFFromData = (title, columns, data, filename = 'reporte.pdf') => {
    
    // 1. Crear la instancia del PDF
    const pdf = new jsPDF('p', 'mm', 'a4'); 
    
    // 2. Configurar título
    pdf.setFontSize(18);
    pdf.text(title, 14, 20); 
    
    // 3. Generar la tabla
    autoTable(pdf, {
        startY: 30, 
        head: [columns],
        body: data,
        theme: 'striped', 
        styles: {
            fontSize: 8, // Fuente más pequeña para que quepa en A4
            cellPadding: 2,
            overflow: 'linebreak', 
        },
        headStyles: {
            fillColor: [60, 60, 60], 
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        // CONFIGURACIÓN DE LAS 6 COLUMNAS: Ajusta el ancho para que quepa todo en A4 (210mm)
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },  // ID
            1: { cellWidth: 25 },                    // Fecha
            2: { cellWidth: 40 },                    // Cliente
            3: { cellWidth: 55 },                    // Servicios (ancho mayor)
            4: { cellWidth: 25, halign: 'center' },  // Estado
            5: { cellWidth: 25, halign: 'right' }    // Total Est. (S/)
        }
    });

    // 4. Descargar
    pdf.save(filename);
};


// ----------------------------------------------------------------------------------
// ** FUNCIÓN CLAVE CORREGIDA PARA MAESTRO-DETALLE **
// ----------------------------------------------------------------------------------

/**
 * Genera una ORDEN DE SERVICIO INDIVIDUAL (Maestro-Detalle)
 * Estructura: Cabecera (Datos de la Solicitud/Cliente) + Detalle (Tabla de Ítems).
 */
export const generateSingleRequestPDF = (requestData, filename = 'solicitud.pdf') => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm

    // Helper para formatear moneda
    const currency = (amount) => `S/ ${parseFloat(amount || 0).toFixed(2)}`;

    // --- 1. ENCABEZADO SUPERIOR ---
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("ORDEN DE SERVICIO", pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Reporte Transaccional Detallado", pageWidth / 2, 26, { align: 'center' });

    // Línea separadora
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 32, 195, 32);

    // --- 2. CABECERA (Datos Generales) ---
    
    // Caja Izquierda: Info de la Solicitud
    pdf.setFillColor(245, 247, 250); // Fondo gris claro
    // Aumentamos la altura de la caja a 45mm para el estado
    pdf.roundedRect(15, 40, 85, 45, 3, 3, 'F'); 
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Información de Solicitud", 20, 48);
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    
    // N° Solicitud
    pdf.text(`N° Solicitud:`, 20, 58);
    pdf.setFont("helvetica", "bold");
    pdf.text(`#${requestData.service_request_id}`, 50, 58);
    
    // Fecha
    pdf.setFont("helvetica", "normal");
    pdf.text(`Fecha:`, 20, 66);
    pdf.text(requestData.request_date || '-', 50, 66);

    // Estado
    pdf.text(`Estado:`, 20, 74);
    let statusColor = [0, 0, 0];
    // Usamos el status original que viene en requestData
    if (requestData.status === 'COMPLETADA') statusColor = [0, 150, 0]; // Verde
    if (requestData.status === 'CANCELADA') statusColor = [200, 0, 0]; // Rojo
    
    pdf.setTextColor(...statusColor);
    pdf.setFont("helvetica", "bold");
    pdf.text(requestData.status || 'PENDIENTE', 50, 74);
    pdf.setTextColor(0, 0, 0); // Reset color

    // Caja Derecha: Info del Cliente
    pdf.setFillColor(245, 247, 250);
    // Aumentamos la altura de la caja a 45mm para la info del cliente
    pdf.roundedRect(110, 40, 85, 45, 3, 3, 'F');

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Información del Cliente", 115, 48);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    
    // Obtenemos los datos del cliente de forma segura (Corregido)
    const clientId = requestData.customer?.id || requestData.customer_id || 'N/A';
    const clientName = `${requestData.customer?.name || ''} ${requestData.customer?.surname || ''}`.trim() || 'No Asignado';

    // ID Cliente
    pdf.text(`ID Cliente:`, 115, 58);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${clientId}`, 145, 58); 

    // Nombre Cliente
    pdf.setFont("helvetica", "normal");
    pdf.text(`Nombre:`, 115, 66);
    pdf.text(clientName, 145, 66); 

    // --- 3. DETALLE (Tabla de Ítems) ---
    
    // Transformamos los items para autoTable, incluyendo el campo de notas/detalle por ítem
    // **ESTO REEMPLAZA LA TABLA DE UNA SOLA FILA**
    const tableBody = requestData.items?.map(item => [
        item.service_name,
        item.quantity,
        // Usamos el campo que contenga la nota específica del ítem 
        item.notes || item.detail_notes || '---', 
        currency(item.unit_price),
        currency(item.subtotal)
    ]) || [];

    autoTable(pdf, {
        startY: 95,
        // Incluimos la columna de Detalle
        head: [['Descripción del Servicio', 'Cant.', 'Detalle/Notas', 'P. Unit.', 'Subtotal']],
        body: tableBody,
        theme: 'striped',
        headStyles: {
            fillColor: [79, 70, 229], 
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 50 },                 // Descripción
            1: { cellWidth: 15, halign: 'center' }, // Cant.
            2: { cellWidth: 'auto' },             // Detalle/Notas (flexible)
            3: { cellWidth: 25, halign: 'right' },  // P. Unit.
            4: { cellWidth: 25, halign: 'right' }   // Subtotal
        },
        styles: {
            cellPadding: 3,
            fontSize: 9 // Fuente pequeña para que quepa todo
        },
        // Pie de tabla para el TOTAL
        foot: [[
            { content: 'TOTAL GENERAL:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: currency(requestData.total_estimated), styles: { halign: 'right', fontStyle: 'bold', textColor: [79, 70, 229] } }
        ]]
    });

    // --- 4. NOTAS ADICIONALES (GENERALES) ---
    let finalY = pdf.lastAutoTable.finalY + 10;
    
    if (requestData.notes) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Observaciones Generales:", 15, finalY);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const notes = requestData.notes.replace('CANCELLED - ', 'CANCELADO: ');
        // Manejo de saltos de línea para notas largas
        const splitNotes = pdf.splitTextToSize(notes, 180);
        pdf.text(splitNotes, 15, finalY + 6);
        
        finalY += (splitNotes.length * 5) + 10;
    } else {
        finalY += 10;
    }

    // --- 5. PIE DE PÁGINA (Firmas) ---
    const signatureY = Math.max(finalY + 20, 250); // Asegurar que no se superponga con el footer

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0, 0, 0);
    pdf.line(30, signatureY, 90, signatureY); // Línea Izq
    pdf.line(120, signatureY, 180, signatureY); // Línea Der

    pdf.setFontSize(9);
    pdf.text("Firma Responsable Laboratorio", 60, signatureY + 5, { align: 'center' });
    pdf.text("Conformidad Cliente", 150, signatureY + 5, { align: 'center' });

    // Timestamp
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`Generado el: ${new Date().toLocaleString()}`, 195, 290, { align: 'right' });

    pdf.save(filename);
};