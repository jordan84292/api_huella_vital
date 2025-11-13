/**
 * Rutas de Clientes
 * @description Define todas las rutas REST para la gestión de clientes
 */

const express = require("express");
const router = express.Router();
const ClientController = require("../controllers/clientController");
const {
  validateClient,
  validateClientId,
} = require("../middleware/validation");

/**
 * @route GET /clients/search
 * @description Busca clientes por nombre, email o teléfono
 * @access Public
 * @param {string} q - Término de búsqueda (query parameter)
 * @returns {Object} Lista de clientes que coinciden con la búsqueda
 */
router.get("/search", ClientController.searchClients);

/**
 * @route GET /clients/stats
 * @description Obtiene estadísticas de clientes
 * @access Public
 * @returns {Object} Estadísticas del sistema de clientes
 */
router.get("/stats", ClientController.getClientStats);

/**
 * @route GET /clients
 * @description Obtiene todos los clientes con paginación opcional
 * @access Public
 * @param {number} [page=1] - Número de página
 * @param {number} [limit=10] - Límite de clientes por página
 * @param {string} [search] - Término de búsqueda por nombre
 * @returns {Object} Lista de clientes con metadatos de paginación
 */
router.get("/", ClientController.getAllClients);

/**
 * @route GET /clients/:id
 * @description Obtiene un cliente específico por ID
 * @access Public
 * @param {number} id - ID del cliente
 * @returns {Object} Datos del cliente solicitado
 */
router.get("/:id", validateClientId, ClientController.getClientById);

/**
 * @route POST /clients
 * @description Crea un nuevo cliente
 * @access Public
 * @body {string} name - Nombre completo del cliente (requerido)
 * @body {string} email - Email único del cliente (requerido)
 * @body {string} phone - Número de teléfono del cliente (requerido)
 * @body {string} address - Dirección del cliente (requerido)
 * @body {string} city - Ciudad del cliente (requerido)
 * @body {string} status - Estado del cliente (Activo/Inactivo)
 * @returns {Object} Cliente creado
 */
router.post("/", validateClient, ClientController.createClient);

/**
 * @route PUT /clients/:id
 * @description Actualiza un cliente existente
 * @access Public
 * @param {number} id - ID del cliente a actualizar
 * @body {string} name - Nombre completo del cliente (requerido)
 * @body {string} email - Email único del cliente (requerido)
 * @body {string} phone - Número de teléfono del cliente (requerido)
 * @body {string} address - Dirección del cliente (requerido)
 * @body {string} city - Ciudad del cliente (requerido)
 * @body {string} status - Estado del cliente (Activo/Inactivo)
 * @returns {Object} Cliente actualizado
 */
router.put(
  "/:id",
  validateClientId,
  validateClient,
  ClientController.updateClient
);

/**
 * @route DELETE /clients/:id
 * @description Elimina un cliente
 * @access Public
 * @param {number} id - ID del cliente a eliminar
 * @returns {Object} Mensaje de confirmación
 */
router.delete("/:id", validateClientId, ClientController.deleteClient);

module.exports = router;
