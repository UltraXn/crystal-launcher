const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // Asumiendo que usaremos DB pronto

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Lógica de registro pendiente...
        res.json({ message: 'Registro exitoso (Simulado)' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Lógica de login pendiente...
        // 1. Buscar usuario por email
        // 2. Comparar password con bcrypt.compare()
        // 3. Generar token JWT
        res.json({
            message: 'Login exitoso (Simulado)',
            token: 'fake-jwt-token-xyz',
            user: { email, role: 'user' }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.getMe = async (req, res) => {
    // Validar token y devolver info del usuario
    res.json({ user: { name: 'Usuario Verificado' } });
};
