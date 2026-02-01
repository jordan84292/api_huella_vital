/**
 * Controlador de Clientes
 * @description Maneja todas las operaciones HTTP para la entidad Cliente
 */

const Client = require("../models/Client");
const User = require("../models/User");
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

      // Permitir que el frontend envíe 'id' como alias de 'cedula'
      const { id, cedula, name, email, phone, address, city, status } =
        req.body;
      const cedulaFinal = cedula || id;

      // Verificar si el email ya existe
      const existingClient = await Client.findByEmail(email);
      if (existingClient) {
        return res.status(409).json({
          success: false,
          message: "El email ya está registrado",
        });
      }

      // Verificar si ya existe un usuario con este email
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Ya existe un usuario con este email",
        });
      }

      // Crear el cliente
      const newClient = await Client.create({
        cedula: cedulaFinal,
        name,
        email,
        phone,
        address,
        city,
        status: status || "Activo",
      });

      // Crear automáticamente un usuario de tipo "Cliente" para la app móvil
      try {
        const newUser = await User.create({
          nombre: name,
          email: email,
          telefono: phone,
          rolName: "Cliente", // Rol específico para clientes
          status: "Activo",
          // Password por defecto (se puede cambiar después)
          password:
            "$2a$12$EvXWYFrmIDImmqpUckeb6.VwCSIi8JX4guQevhu9lJzfElf6AdRvu", // password: 123456
        });

        console.log(
          `Usuario creado automáticamente para cliente ${name} con email ${email}`,
        );
      } catch (userError) {
        console.error("Error al crear usuario automáticamente:", userError);
        // No devolver error ya que el cliente se creó correctamente
        // Solo loguear el error para debugging
      }

      res.status(201).json({
        success: true,
        message: "Cliente creado correctamente y usuario de acceso generado",
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
      const { cedula, name, email, phone, address, city, status } = req.body;

      // Validar que la cédula sea válida
      const cedulaFinal = cedula || id;
      if (!cedulaFinal || isNaN(cedulaFinal)) {
        return res.status(400).json({
          success: false,
          message: "La cédula debe ser un número válido",
        });
      }

      // Verificar si el cliente existe
      const existingClient = await Client.findById(cedulaFinal);
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      // Verificar si el email ya existe en otro cliente
      if (email !== existingClient.email) {
        const emailClient = await Client.findByEmail(email);
        if (emailClient && emailClient.cedula !== cedulaFinal) {
          return res.status(409).json({
            success: false,
            message: "El email ya está registrado en otro cliente",
          });
        }
      }

      // Actualizar el cliente
      const updatedClient = await Client.update(cedulaFinal, {
        cedula: cedulaFinal,
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

      console.log(
        `Eliminando cliente: ${existingClient.name} (${existingClient.email})`,
      );

      // Buscar y eliminar el usuario asociado por email y rol Cliente (5)
      let userDeleted = false;
      try {
        console.log(
          `Buscando usuario asociado con email: ${existingClient.email}`,
        );
        const associatedUser = await User.findByEmail(existingClient.email);

        if (associatedUser) {
          console.log(`Usuario encontrado:`, {
            id: associatedUser.id,
            nombre: associatedUser.nombre,
            email: associatedUser.email,
            rol: associatedUser.rol,
          });

          if (associatedUser.rol === "5") {
            console.log(
              `Eliminando usuario con rol Cliente (5): ${associatedUser.id}`,
            );
            const deleteResult = await User.delete(associatedUser.id);
            console.log(`Resultado eliminación usuario:`, deleteResult);
            userDeleted = true;
            console.log(
              `Usuario asociado eliminado exitosamente: ${existingClient.email}`,
            );
          } else {
            console.log(
              `Usuario encontrado pero no es Cliente (rol: ${associatedUser.rol}), no se elimina`,
            );
          }
        } else {
          console.log(
            `No se encontró usuario asociado con email: ${existingClient.email}`,
          );
        }
      } catch (userError) {
        console.error("Error al eliminar usuario asociado:", userError);
        console.error("Stack trace:", userError.stack);
        // Continuamos con la eliminación del cliente aunque falle la eliminación del usuario
      }

      // Eliminar el cliente
      console.log(`Eliminando cliente con ID: ${id}`);
      await Client.delete(id);
      console.log(`Cliente eliminado exitosamente`);

      const message = userDeleted
        ? "Cliente y usuario asociado eliminados correctamente"
        : "Cliente eliminado correctamente (no se encontró usuario asociado o no era de tipo Cliente)";

      res.status(200).json({
        success: true,
        message: message,
      });
    } catch (error) {
      console.error("Error en deleteClient:", error);
      console.error("Stack trace:", error.stack);
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
