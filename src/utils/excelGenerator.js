import * as XLSX from 'xlsx';

/**
 * Genera y descarga un archivo Excel (.xlsx) a partir de un array de objetos.
 * @param {Object[]} data - Datos formateados (Array de objetos json)
 * @param {string} filename - Nombre del archivo (ej: 'reporte.xlsx')
 * @param {string} sheetName - Nombre de la hoja dentro del excel
 */
export const generateExcel = (data, filename = 'reporte.xlsx', sheetName = 'Datos') => {
    // 1. Convertir el JSON a una hoja de trabajo (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Opcional: Ajustar anchos de columna automáticamente (básico)
    const columnWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
    worksheet['!cols'] = columnWidths;

    // 2. Crear un libro de trabajo (Workbook)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 3. Descargar el archivo
    XLSX.writeFile(workbook, filename);
};

/**
 * Genera un Excel con formato mejorado para muestras
 * @param {Object[]} samples - Array de muestras
 * @param {string} filename - Nombre del archivo
 */
export const generateSamplesExcel = (samples, filename = 'muestras.xlsx') => {
    const workbook = XLSX.utils.book_new();
    
    // Preparar datos para Excel
    const excelData = samples.map(sample => {
        // Mapeo de estados
        const statusMap = {
            1: 'REGISTRADA',
            2: 'EN RECEPCIÓN',
            3: 'EN ANÁLISIS',
            4: 'ANALIZADA',
            5: 'EN REVISIÓN',
            6: 'APROBADA',
            7: 'RECHAZADA',
            8: 'EN CORRECCIÓN',
            9: 'COMPLETADA',
            10: 'ENVIADA',
            11: 'ENTREGADA',
            12: 'ARCHIVADA'
        };
        
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } catch {
                return dateString.split('T')[0] || dateString;
            }
        };
        
        return {
            'Código': sample.sample_code || 'N/A',
            'ID': sample.sample_id || 'N/A',
            'Fecha Recolección': formatDate(sample.collection_date),
            'Ubicación': sample.collection_location || 'N/A',
            'Tipo Muestra': sample.sample_type_name || `Tipo ${sample.sample_type_id}` || 'N/A',
            'Estado': statusMap[sample.current_status_id] || `ESTADO ${sample.current_status_id}` || 'N/A'
        };
    });
    
    // Crear hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Ajustar anchos de columna
    worksheet['!cols'] = [
        { wch: 15 }, // Código
        { wch: 8 },  // ID
        { wch: 18 }, // Fecha Recolección
        { wch: 30 }, // Ubicación
        { wch: 20 }, // Tipo Muestra
        { wch: 15 }  // Estado
    ];
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Muestras');
    
    // Descargar
    XLSX.writeFile(workbook, filename);
};

/**
 * Genera un Excel con formato mejorado para resultados
 * @param {Object[]} results - Array de resultados
 * @param {string} filename - Nombre del archivo
 */
export const generateResultsExcel = (results, filename = 'resultados.xlsx') => {
    const workbook = XLSX.utils.book_new();
    
    // Preparar datos para Excel
    const excelData = results.map(result => {
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } catch {
                return dateString.split('T')[0] || dateString;
            }
        };
        
        return {
            'ID Resultado': result.analysis_result_id || 'N/A',
            'Muestra ID': result.sample_id || 'N/A',
            'Parámetro': result.parameter_name || 'N/A',
            'Valor': result.result_value !== null && result.result_value !== undefined ? result.result_value : 'N/A',
            'Unidad': result.unit || '-',
            'Fecha Análisis': formatDate(result.analysis_date)
        };
    });
    
    // Crear hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Ajustar anchos de columna
    worksheet['!cols'] = [
        { wch: 12 }, // ID Resultado
        { wch: 12 }, // Muestra ID
        { wch: 25 }, // Parámetro
        { wch: 15 }, // Valor
        { wch: 12 }, // Unidad
        { wch: 18 }  // Fecha Análisis
    ];
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');
    
    // Descargar
    XLSX.writeFile(workbook, filename);
};