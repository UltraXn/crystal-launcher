import express from 'express';
import * as newsController from '../controllers/newsController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Noticias
 *   description: Gestión de noticias y anuncios
 */

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Obtener todas las noticias
 *     tags: [Noticias]
 *     responses:
 *       200:
 *         description: Lista de noticias
 *   post:
 *     summary: Crear una nueva noticia (Admin)
 *     tags: [Noticias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Noticia creada
 */
router.get('/', newsController.getAllNews);
router.post('/', newsController.createNews);

router.get('/:id', newsController.getNewsById);
router.get('/:id/comments', newsController.getCommentsByNewsId);
router.post('/:id/comments', newsController.createComment);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

export default router;
