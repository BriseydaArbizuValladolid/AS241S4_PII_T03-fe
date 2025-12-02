import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faArrowLeft, faSave, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '../shared/api/clientApi';

// 🚨 IMPORTACIÓN NECESARIA PARA LA PRIMERA LLAMADA (GUARDAR LA DIRECCIÓN)
import { createAddress } from '../shared/api/addressApi'; 


// --- DEFINICIÓN DE EXPRESIONES REGULARES ---
const NAME_REGEX = /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]*$/; 
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
const PHONE_REGEX = /^9\d{8}$/;

const FormClient = ({ onBack }) => {
    
    // --- ESTADO INICIAL COMPLETO (Cliente + Dirección) ---
    const [formData, setFormData] = useState({
        // Datos Personales (Obligatorios)
        name: '',
        surname: '',
        email: '',
        phone_number: '',
        state: 'A', // Estado por defecto
        
        // Datos de Dirección 
        country: 'Perú', 
        department: '',
        province: '',
        district: '',
        street: '',
        zip_code: '', 
        reference: '',
    });
    
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        let newErrors = { ...validationErrors };
        
        // --- 1. VALIDACIÓN EN TIEMPO REAL ---

        // A. Validar Nombre y Apellido (Solo letras)
        if (id === 'name' || id === 'surname') {
            if (!NAME_REGEX.test(value)) {
                newErrors[id] = 'Solo se permiten letras y espacios. No se permiten números.';
            } else {
                newErrors[id] = '';
            }
        }
        
        // B. Validar Email
        else if (id === 'email') {
            const trimmedValue = value.trim();
            if (trimmedValue.includes('@') && !EMAIL_REGEX.test(trimmedValue)) { 
                newErrors[id] = 'El formato del email no es válido (ej. usuario@dominio.com).'; 
            } else {
                newErrors[id] = '';
            }
        }
        
        // C. Validar Teléfono (Solo 9 dígitos, empieza con 9)
        else if (id === 'phone_number') {
            const numericValue = value.replace(/[^0-9]/g, '');
            let finalValue = numericValue.slice(0, 9);
            e.target.value = finalValue; 
            
            if (finalValue.length === 9 && !PHONE_REGEX.test(finalValue)) {
                newErrors[id] = 'Debe empezar con 9 y tener 9 dígitos.';
            } else if (finalValue.length > 0 && finalValue.length < 9 && finalValue.startsWith('9')) {
                newErrors[id] = 'Faltan dígitos (9 en total).';
            } else if (finalValue.length > 0 && !finalValue.startsWith('9')) {
                newErrors[id] = 'Debe empezar con el número 9.';
            } else {
                newErrors[id] = '';
            }
        }
        
        // D. Validación de Campos de Dirección Obligatorios
        const requiredAddressFields = ['department', 'province', 'district', 'street'];
        if (requiredAddressFields.includes(id)) {
            if (value.trim().length === 0) {
                 const fieldName = id.replace('_', ' ').charAt(0).toUpperCase() + id.replace('_', ' ').slice(1);
                 newErrors[id] = `${fieldName} es obligatorio.`;
               } else {
                   newErrors[id] = '';
               }
        }

        // Actualizar el estado del formulario y los errores
        setFormData(prev => ({
            ...prev,
            [id]: id === 'phone_number' ? e.target.value : value 
        }));
        setValidationErrors(newErrors);
    };

    // --- 2. VALIDACIÓN FINAL ANTES DE ENVÍO ---
    const validateForm = () => {
        let newErrors = { ...validationErrors }; 
        let isValid = true;
        
        const requiredFields = {
            name: 'El nombre es obligatorio.',
            surname: 'El apellido es obligatorio.',
            email: 'El email es obligatorio.',
            department: 'El Departamento es obligatorio.',
            province: 'La Provincia es obligatoria.',
            district: 'El Distrito es obligatorio.',
            street: 'La Calle/Dirección es obligatoria.',
        };

        // 1. Revisar campos obligatorios
        Object.entries(requiredFields).forEach(([key, message]) => {
            if (!formData[key].trim()) {
                newErrors[key] = message;
                isValid = false;
            } else if (validationErrors[key]) {
                 isValid = false;
            }
        });
        
        // 2. Validación específica de Teléfono
        const phone = formData.phone_number.trim();
        if (phone) {
            if (phone.length !== 9 || !PHONE_REGEX.test(phone)) {
                 newErrors.phone_number = 'El teléfono debe tener 9 dígitos y empezar con 9.';
                 isValid = false;
            } else {
                 newErrors.phone_number = '';
            }
        } else {
             newErrors.phone_number = ''; 
        }

        // 3. Revisar si hay CUALQUIER error de validación
        if (Object.values(newErrors).some(err => err)) {
            isValid = false;
        }

        setValidationErrors(newErrors);
        return isValid;
    };

    // --- 3. LÓGICA DE ENVÍO CON DOBLE LLAMADA (CORREGIDA) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            setError('Hay errores en el formulario. Por favor revisa los campos marcados.');
            return;
        }

        setLoading(true);

        try {
            // --- PASO 1: CREAR LA DIRECCIÓN PARA OBTENER address_id ---
            const addressPayload = {
                street: formData.street.trim(),
                zip_code: formData.zip_code.trim(),
                country: formData.country.trim(),
                department: formData.department.trim(),
                province: formData.province.trim(),
                district: formData.district.trim(),
                reference: formData.reference.trim(),
            };

            console.log('📤 1. Enviando Dirección:', JSON.stringify(addressPayload, null, 2));

            const addressResponse = await createAddress(addressPayload); 
            
            // 🚨 AJUSTE ROBUSTO: Intenta capturar el ID como 'id' o 'address_id'
            const addressId = addressResponse.id || addressResponse.address_id; 
            
            if (!addressId) {
                 console.error("Respuesta inesperada de la API de dirección:", addressResponse);
                 throw new Error("El backend de la dirección no devolvió un ID válido ('id' o 'address_id').");
            }

            console.log(`✅ Dirección creada con ID: ${addressId}`);

            // --- PASO 2: CREAR EL CLIENTE USANDO EL ID DE DIRECCIÓN ---
            const clientPayload = {
                name: formData.name.trim(),
                surname: formData.surname.trim(),
                email: formData.email.trim(),
                phone_number: formData.phone_number.trim(),
                state: 'A',
                
                // 📌 Clave foránea
                address_id: addressId, 
            };

            console.log('📤 2. Enviando Cliente con address_id:', JSON.stringify(clientPayload, null, 2));
            const clientResponse = await createClient(clientPayload); 
            
            console.log('✅ Cliente creado:', clientResponse);
            
            // Si todo es exitoso, regresamos
            onBack(); 
        } catch (err) {
            console.error('❌ Error general durante el proceso de guardado:', err);
            // Intenta extraer un mensaje de error útil de la respuesta de la API
            const apiMessage = err.response?.data?.detail || err.response?.data?.message;
            const errorMessage = apiMessage || err.message || 'Error desconocido al intentar guardar cliente/dirección.';
            setError(`Error en el registro: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };


    // --- RENDERIZADO DEL COMPONENTE (Mantenido Igual) ---
    return (
        <main className="p-6 flex-1">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div className="flex items-center space-x-4">
                    <FontAwesomeIcon icon={faUserPlus} className="text-3xl text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Registro de Cliente</h1>
                        <p className="text-gray-500 mt-1">Ingresa los datos del nuevo cliente para su registro.</p>
                    </div>
                </div>
                
                <button
                    onClick={onBack} 
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition shadow-sm"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Regresar a la Lista</span>
                </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Sección de Datos Personales */}
                    <div>
                        <h2 className="text-xl font-semibold mb-6 text-indigo-700">Datos Personales</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* CAMPO NOMBRE */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 ${validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                                    placeholder="Juan Carlos"
                                    required
                                />
                                {validationErrors.name && (<p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>)}
                            </div>

                            {/* CAMPO APELLIDOS */}
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                                    Apellidos <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="surname"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 ${validationErrors.surname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                                    placeholder="Pérez García"
                                    required
                                />
                                {validationErrors.surname && (<p className="mt-1 text-sm text-red-600">{validationErrors.surname}</p>)}
                            </div>

                            {/* CAMPO EMAIL */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email" 
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                                    placeholder="juan.perez@agroperu.com"
                                    required
                                />
                                {validationErrors.email && (<p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>)}
                            </div>

                            {/* CAMPO TELÉFONO */}
                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono (9 dígitos, debe iniciar con 9)
                                </label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 ${validationErrors.phone_number ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                                    placeholder="987654321"
                                    maxLength="9"
                                />
                                {validationErrors.phone_number && (<p className="mt-1 text-sm text-red-600">{validationErrors.phone_number}</p>)}
                            </div>
                        </div>
                    </div>
                    
                    {/* --- SECCIÓN DE DIRECCIÓN COMPLETA --- */}
                    <div>
                        <div className="flex items-center space-x-2 mb-6 border-t pt-4 mt-4">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xl text-indigo-700" />
                            <h2 className="text-xl font-semibold text-indigo-700">Datos de Dirección</h2>
                        </div>
                        
                        {/* Fila 1: País y Departamento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                    País
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 border-gray-300 cursor-not-allowed`}
                                    readOnly 
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                    Departamento <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 ${validationErrors.department ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Lima"
                                    required
                                />
                                {validationErrors.department && (<p className="mt-1 text-sm text-red-600">{validationErrors.department}</p>)}
                            </div>
                        </div>

                        {/* Fila 2: Provincia y Distrito */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                                    Provincia <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 ${validationErrors.province ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Lima"
                                    required
                                />
                                {validationErrors.province && (<p className="mt-1 text-sm text-red-600">{validationErrors.province}</p>)}
                            </div>

                            <div>
                                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                                    Distrito <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 ${validationErrors.district ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="San Isidro"
                                    required
                                />
                                {validationErrors.district && (<p className="mt-1 text-sm text-red-600">{validationErrors.district}</p>)}
                            </div>
                        </div>

                        {/* Fila 3: Calle y Código Postal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                                    Calle / Dirección <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 ${validationErrors.street ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Av. Javier Prado Este 4200"
                                    required
                                />
                                {validationErrors.street && (<p className="mt-1 text-sm text-red-600">{validationErrors.street}</p>)}
                            </div>

                            <div>
                                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                                    Código Postal (Opcional)
                                </label>
                                <input
                                    type="text"
                                    id="zip_code"
                                    value={formData.zip_code}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 ${validationErrors.zip_code ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="15036"
                                />
                                {validationErrors.zip_code && (<p className="mt-1 text-sm text-red-600">{validationErrors.zip_code}</p>)}
                            </div>
                        </div>

                        {/* Fila 4: Referencia Adicional */}
                        <div>
                            <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                                Referencia Adicional (Opcional)
                            </label>
                            <textarea
                                id="reference"
                                rows="3"
                                value={formData.reference}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 text-white bg-gray-700 border-gray-300`}
                                placeholder="Cerca al Jockey Plaza"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading || Object.values(validationErrors).some(err => err)}
                            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faSave} />
                            <span>{loading ? 'Guardando...' : 'Guardar Cliente'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default FormClient;