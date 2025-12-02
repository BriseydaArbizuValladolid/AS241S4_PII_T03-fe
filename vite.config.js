import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    // ------------------------------------------------------------------
    // Paso 1: Excluir para evitar que Vite optimice previamente estos módulos
    // Esto asegura que se procesen correctamente en tiempo de compilación.
    optimizeDeps: {
        exclude: [
            'jspdf',
            'jspdf-autotable'
        ]
    },
    // ------------------------------------------------------------------
    // Paso 2: Alias para forzar a jspdf a usar la versión de ES Module completa
    // Esto resuelve problemas donde los plugins (como autoTable) no se adjuntan.
    resolve: {
        alias: {
            'jspdf': 'jspdf/dist/jspdf.es.min.js',
        },
    },
    // ------------------------------------------------------------------
})