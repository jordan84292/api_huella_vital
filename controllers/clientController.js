/**
 * Controlador de Clientes
 * @description Maneja todas las operaciones HTTP para la entidad Cliente
 */

const Client = require("../models/Client");
const { validationResult } = require("express-validator");

/**
 * Clase que maneja las operaciones del controlador de clientes
 */
class ClientController {
  /**
   * Obtiene todos los clientes con paginación opcional
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async getAllClients(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search;

      let result;

      if (search) {
        // Si hay parámetro de búsqueda, buscar por nombre
        const clients = await Client.searchByName(search);
        result = {
          clients,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalClients: clients.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      } else {
        // Obtener clientes con paginación
        result = await Client.paginate(page, limit);
      }

      res.status(200).json({
        success: true,
        message: "Clientes obtenidos correctamente",
        data: result.clients,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error en getAllClients:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene un cliente por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async getClientById(req, res) {
    try {
      const { id } = req.params;

      // Validar que el ID sea un número
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "El ID debe ser un número válido",
        });
      }

      const client = await Client.findById(id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Cliente obtenido correctamente",
        data: client,
      });
    } catch (error) {
      console.error("Error en getClientById:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Crea un nuevo cliente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async createClient(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { id, name, email, phone, address, city, status } = req.body;

      // Verificar si el email ya existe
      const existingClient = await Client.findByEmail(email);
      if (existingClient) {
        return res.status(409).json({
          success: false,
          message: "El email ya está registrado",
        });
      }

      // Crear el cliente
      const newClient = await Client.create({
        id,
        name,
        email,
        phone,
        address,
        city,
        status: status || "Activo",
      });

      res.status(201).json({
        success: true,
        message: "Cliente creado correctamente",
        data: newClient,
      });
    } catch (error) {
      console.error("Error en createClient:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Actualiza un cliente existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async updateClient(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { name, email, phone, address, city, status } = req.body;

      // Validar que el ID sea un número
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "El ID debe ser un número válido",
        });
      }

      // Verificar si el cliente existe
      const existingClient = await Client.findById(id);
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      // Verificar si el email ya existe en otro cliente
      if (email !== existingClient.email) {
        const emailClient = await Client.findByEmail(email);
        if (emailClient && emailClient.id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            message: "El email ya está registrado en otro cliente",
          });
        }
      }

      // Actualizar el cliente
      const updatedClient = await Client.update(id, {
        name,
        email,
        phone,
        address,
        city,
        status,
      });

      res.status(200).json({
        success: true,
        message: "Cliente actualizado correctamente",
        data: updatedClient,
      });
    } catch (error) {
      console.error("Error en updateClient:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Elimina un cliente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async deleteClient(req, res) {
    try {
      const { id } = req.params;

      // Validar que el ID sea un número
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "El ID debe ser un número válido",
        });
      }

      // Verificar si el cliente existe
      const existingClient = await Client.findById(id);
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      // Eliminar el cliente
      await Client.delete(id);

      res.status(200).json({
        success: true,
        message: "Cliente eliminado correctamente",
      });
    } catch (error) {
      console.error("Error en deleteClient:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Busca clientes por nombre, email o teléfono
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async searchClients(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "El parámetro de búsqueda es requerido",
        });
      }

      const clients = await Client.searchByName(q.trim());

      res.status(200).json({
        success: true,
        message: "Búsqueda completada",
        data: clients,
        count: clients.length,
      });
    } catch (error) {
      console.error("Error en searchClients:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene estadísticas de clientes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async getClientStats(req, res) {
    try {
      const total = await Client.count();

      res.status(200).json({
        success: true,
        message: "Estadísticas obtenidas correctamente",
        data: {
          totalClients: total,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error en getClientStats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

module.exports = ClientController;
