import swaggerJsdoc from 'swagger-jsdoc';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CrystalTides SMP API',
            version: '1.0.0',
            description: 'API oficial para la gestión del sitio web, panel de administración y servicios de juego de CrystalTides SMP.',
            contact: {
                name: 'Soporte CrystalTides',
                url: 'https://crystaltidessmp.net/support',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001/api',
                description: 'Servidor de Desarrollo',
            },
            {
                url: 'https://api.crystaltidessmp.net/api',
                description: 'Servidor de Producción',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Archivos donde buscar anotaciones @swagger
    apis: ['./routes/*.ts', './routes/*.js'],
};
export const swaggerSpec = swaggerJsdoc(options);
