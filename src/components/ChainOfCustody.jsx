import React from 'react';

/**
 * Componente de Cadena de Custodia
 * Replica el formulario exacto del documento físico
 */
const ChainOfCustody = ({ data }) => {
    // Datos por defecto si no vienen del backend
    const formData = data || {
        client_code: '',
        contract_number: '',
        date: new Date().toLocaleDateString('es-PE'),
        company_name: '',
        ruc: '',
        address: '',
        district: '',
        province: '',
        contact: '',
        phone: '',
        cell: '',
        email: '',
        telefax: '',
        farm: '',
        sampled_by: '',
        samples: [],
        observations: '',
        delivered_by: '',
        delivered_signature: '',
        delivered_date: '',
        delivered_time: '',
        received_by: '',
        received_signature: '',
        received_date: '',
        received_time: '',
        sampling_correct: '',
        container_adequate: '',
        samples_within_period: '',
        comments: '',
        quoted: false,
        invoiced: false,
        paid: false,
        sent: false
    };

    // Tipos de muestra (MATRIZ)
    const sampleTypes = {
        'SUE': 'Suelo',
        'FOL': 'Foliar',
        'AGU': 'Agua',
        'EIS': 'Enm. Inorg Sólida',
        'EOS': 'Enm.Org. líquida',
        'FERT': 'Fertilizantes',
        'FRUT': 'Frutos',
        'SVG': 'Savia Veget.',
        'OTROS': 'Otros insumos'
    };

    return (
        <div className="bg-white p-8" id="chain-of-custody-form" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <h1 className="text-2xl font-bold text-green-800">VALLE GRANDE</h1>
                        <p className="text-sm text-green-700">Laboratorio de Química Agrícola</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-green-600 mb-4">CADENA DE CUSTODIA</h2>
                    <div className="bg-gray-50 p-3 rounded border border-gray-300 text-xs">
                        <p className="font-semibold mb-2">(Llenado únicamente por el personal de recepción)</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-gray-600 mb-1">CODIGO CLIENTE</label>
                                <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.client_code || '________'}</div>
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1">Nº DE CONTRATO</label>
                                <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.contract_number || '________'}</div>
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1">FECHA</label>
                                <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.date || '________'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DATOS DE LA EMPRESA */}
            <div className="mb-6 border-2 border-gray-300 p-4 rounded">
                <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2">DATOS DE LA EMPRESA (Rellenar con letra imprenta)</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="block text-sm font-semibold mb-1">RAZÓN SOCIAL:</label>
                        <div className="border-b-2 border-gray-400 min-h-[25px]">{formData.company_name || '________________________________________________'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">RUC:</label>
                        <div className="border-b-2 border-gray-400 min-h-[25px]">{formData.ruc || '________________'}</div>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="block text-sm font-semibold mb-1">DIRECCIÓN:</label>
                    <div className="border-b-2 border-gray-400 min-h-[25px] mb-2">{formData.address || '________________________________________________________________'}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">DIST:</label>
                            <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.district || '________________'}</div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">PROV:</label>
                            <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.province || '________________'}</div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="block text-sm font-semibold mb-1">CONTACTO:</label>
                        <div className="border-b-2 border-gray-400 min-h-[25px] mb-2">{formData.contact || '________________________________'}</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs mb-1">TELP:</label>
                                <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.phone || '________'}</div>
                            </div>
                            <div>
                                <label className="block text-xs mb-1">CEL/NEXTEL:</label>
                                <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.cell || '________'}</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">E-MAIL:</label>
                            <div className="border-b-2 border-gray-400 min-h-[25px]">{formData.email || '________________________'}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">TELEFAX:</label>
                            <div className="border-b-2 border-gray-400 min-h-[25px]">{formData.telefax || '________________'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DATOS DEL MUESTREO */}
            <div className="mb-6 border-2 border-gray-300 p-4 rounded">
                <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2">DATOS DEL MUESTREO</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">FUNDO:</label>
                        <div className="border-b-2 border-gray-400 min-h-[25px]">{formData.farm || '________________________________________________'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">MUESTREADO POR:</label>
                        <div className="border-b-2 border-gray-400 min-h-[25px]">{formData.sampled_by || '________________________________'}</div>
                    </div>
                </div>
            </div>

            {/* Tabla de Muestras */}
            <div className="mb-6 border-2 border-gray-300 p-4 rounded">
                <table className="w-full border-collapse border border-gray-400 text-xs">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-400 p-2">COD. LABORATORIO</th>
                            <th className="border border-gray-400 p-2">COD. CAMPO</th>
                            <th className="border border-gray-400 p-2" colSpan="2">MUESTREO</th>
                            <th className="border border-gray-400 p-2">MATRIZ (*)</th>
                            <th className="border border-gray-400 p-2" colSpan="5">SOLICITUD DE ENSAYOS</th>
                            <th className="border border-gray-400 p-2">OBSERVACIONES</th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-400 p-1"></th>
                            <th className="border border-gray-400 p-1"></th>
                            <th className="border border-gray-400 p-1">HORA</th>
                            <th className="border border-gray-400 p-1">FECHA (dd/mm/aa)</th>
                            <th className="border border-gray-400 p-1"></th>
                            <th className="border border-gray-400 p-1">SALINIDAD</th>
                            <th className="border border-gray-400 p-1">CARACT.</th>
                            <th className="border border-gray-400 p-1">NUTRICIÓN</th>
                            <th className="border border-gray-400 p-1">FÍSICO-QUÍMICO</th>
                            <th className="border border-gray-400 p-1">ESPECIAL</th>
                            <th className="border border-gray-400 p-1"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.samples && formData.samples.length > 0 ? (
                            formData.samples.map((sample, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-400 p-2 text-center">{sample.lab_code || '______'}</td>
                                    <td className="border border-gray-400 p-2 text-center">{sample.field_code || '______'}</td>
                                    <td className="border border-gray-400 p-2 text-center">{sample.sampling_time || '____'}</td>
                                    <td className="border border-gray-400 p-2 text-center">{sample.sampling_date || '____/____/____'}</td>
                                    <td className="border border-gray-400 p-2 text-center">{sample.matrix || '____'}</td>
                                    <td className="border border-gray-400 p-2 text-center">{sample.salinity ? '✓' : ''}</td>
                                    <td className="border border-gray-400 p-2 text-center">{sample.characterization ? '✓' : ''}</td>
                                    <td className="border border-gray-400 p-2 text-center">{sample.nutrition ? '✓' : ''}</td>
                                    <td className="border border-gray-400 p-2 text-center">{sample.physicochemical ? '✓' : ''}</td>
                                    <td className="border border-gray-400 p-2 text-center">{sample.special ? '✓' : ''}</td>
                                    <td className="border border-gray-400 p-2 text-xs">{sample.observations || ''}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="border border-gray-400 p-2 text-center">______</td>
                                <td className="border border-gray-400 p-2 text-center">______</td>
                                <td className="border border-gray-400 p-2 text-center">____</td>
                                <td className="border border-gray-400 p-2 text-center">____/____/____</td>
                                <td className="border border-gray-400 p-2 text-center">____</td>
                                <td className="border border-gray-400 p-2 text-center"></td>
                                <td className="border border-gray-400 p-2 text-center"></td>
                                <td className="border border-gray-400 p-2 text-center"></td>
                                <td className="border border-gray-400 p-2 text-center"></td>
                                <td className="border border-gray-400 p-2 text-center"></td>
                                <td className="border border-gray-400 p-2"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* OBSERVACIONES */}
            <div className="mb-6 border-2 border-gray-300 p-4 rounded">
                <h3 className="text-lg font-bold mb-2">OBSERVACIONES</h3>
                <div className="border-2 border-gray-400 min-h-[60px] p-2">{formData.observations || ''}</div>
            </div>

            {/* ENTREGADO POR / RECIBIDO POR */}
            <div className="mb-6 border-2 border-gray-300 p-4 rounded">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">ENTREGADO POR:</label>
                        <div className="border-b-2 border-gray-400 min-h-[25px] mb-2">{formData.delivered_by || '________________________________'}</div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs mb-1">FIRMA:</label>
                                <div className="border-b-2 border-gray-400 min-h-[40px]"></div>
                            </div>
                            <div>
                                <label className="block text-xs mb-1">FECHA (dd/mm/aa)</label>
                                <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.delivered_date || '____/____/____'}</div>
                            </div>
                            <div>
                                <label className="block text-xs mb-1">HORA:</label>
                                <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.delivered_time || '____'}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">RECIBIDO POR:</label>
                        <div className="border-b-2 border-gray-400 min-h-[25px] mb-2">{formData.received_by || '________________________________'}</div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs mb-1">FIRMA:</label>
                                <div className="border-b-2 border-gray-400 min-h-[40px]"></div>
                            </div>
                            <div>
                                <label className="block text-xs mb-1">FECHA (dd/mm/aa)</label>
                                <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.received_date || '____/____/____'}</div>
                            </div>
                            <div>
                                <label className="block text-xs mb-1">HORA:</label>
                                <div className="border-b-2 border-gray-400 min-h-[20px]">{formData.received_time || '____'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONDICIÓN DE LA MUESTRA */}
                <div className="bg-gray-50 p-3 rounded border border-gray-300">
                    <p className="text-xs font-semibold mb-2">(Llenado únicamente por personal de recepción)</p>
                    <h4 className="text-sm font-bold mb-2">CONDICIÓN DE LA MUESTRA EN LA RECEPCIÓN</h4>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                            <label className="block text-xs mb-1">Muestreo realizado correcta:</label>
                            <div className="flex gap-2">
                                <span className={formData.sampling_correct === 'SI' ? 'font-bold' : ''}>SI</span>
                                <span className={formData.sampling_correct === 'NO' ? 'font-bold' : ''}>NO</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs mb-1">Recipiente/envase adecuado:</label>
                            <div className="flex gap-2">
                                <span className={formData.container_adequate === 'SI' ? 'font-bold' : ''}>SI</span>
                                <span className={formData.container_adequate === 'NO' ? 'font-bold' : ''}>NO</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs mb-1">Muestras dentro del periodo:</label>
                            <div className="flex gap-2">
                                <span className={formData.samples_within_period === 'SI' ? 'font-bold' : ''}>SI</span>
                                <span className={formData.samples_within_period === 'NO' ? 'font-bold' : ''}>NO</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs mb-1">COMENTARIOS:</label>
                            <div className="border-2 border-gray-400 min-h-[50px] p-2">{formData.comments || ''}</div>
                        </div>
                        <div>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-xs">
                                    <input type="checkbox" checked={formData.quoted} readOnly className="w-4 h-4" />
                                    Cotizado:
                                </label>
                                <label className="flex items-center gap-2 text-xs">
                                    <input type="checkbox" checked={formData.invoiced} readOnly className="w-4 h-4" />
                                    Facturado:
                                </label>
                                <label className="flex items-center gap-2 text-xs">
                                    <input type="checkbox" checked={formData.paid} readOnly className="w-4 h-4" />
                                    Pagado:
                                </label>
                                <label className="flex items-center gap-2 text-xs">
                                    <input type="checkbox" checked={formData.sent} readOnly className="w-4 h-4" />
                                    Enviado:
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leyenda MATRIZ */}
            <div className="mb-6 border-2 border-gray-300 p-4 rounded bg-gray-50">
                <h4 className="text-sm font-bold mb-2">MATRIZ (*)</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>SUE (Suelo)</div>
                    <div>FOL (Foliar)</div>
                    <div>AGU (Agua)</div>
                    <div>EIS (Enm. Inorg Sólida)</div>
                    <div>EOS (Enm.Org. líquida)</div>
                    <div>FERT (Fertilizantes)</div>
                    <div>FRUT (Frutos)</div>
                    <div>SVG (Savia Veget.)</div>
                    <div>OTROS (Otros insumos)</div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-xs text-center border-t-2 border-gray-400 pt-4">
                <p className="font-semibold mb-2">NOTA: El cliente es el único responsable del correcto llenado de este documento.</p>
                <div className="text-gray-600">
                    <p>Promotora de Obras Sociales y de Instrucción Popular</p>
                    <p>Dirección, Teléfono, Cel, E-mail, Web</p>
                </div>
            </div>

        </div>
    );
};

export default ChainOfCustody;

