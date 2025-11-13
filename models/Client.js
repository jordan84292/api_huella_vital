/**
 * Modelo de Cliente
 * @description Maneja todas las operaciones CRUD para la entidad Cliente
 */

const { pool } = require("../config/database");

/**
 * Clase que representa el modelo de Cliente
 */
class Client {
  /**
   * Constructor para crear una instancia de Cliente
   */
  constructor(clientData) {
    this.id = clientData.id;
    this.name = clientData.name;
    this.email = clientData.email;
    this.phone = clientData.phone;
    this.address = clientData.address;
    this.city = clientData.city;
    this.registrationDate = clientData.registrationDate;
    this.status = clientData.status;
  }

  /**
   * Obtiene todos los clientes de la base de datos
   * @returns {Promise<Array>} Array de clientes
   */
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, email, phone, address, city, registrationDate, status FROM clientes ORDER BY registrationDate DESC"
      );
      return rows;
    } catch (error) {
      console.error("Error en Client.findAll:", error);
      throw new Error("Error al obtener clientes");
    }
  }

  /**
   * Busca un cliente por su ID
   * @param {number} id - ID del cliente
   * @returns {Promise<Object|null>} Cliente encontrado o null
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM clientes WHERE id = ?", [
        id,
      ]);
      console.log(rows);

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Client.findById:", error);
      throw new Error("Error al buscar cliente por ID");
    }
  }

  /**
   * Busca un cliente por su email
   * @param {string} email - Email del cliente
   * @returns {Promise<Object|null>} Cliente encontrado o null
   */
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, email, phone, address, city, registrationDate, status FROM clientes WHERE email = ?",
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Client.findByEmail:", error);
      throw new Error("Error al buscar cliente por email");
    }
  }

  /**
   * Crea un nuevo cliente en la base de datos
   * @param {Object} clientData - Datos del cliente
   * @returns {Promise<Object>} Cliente creado
   */
  static async create(clientData) {
    try {
      const { id, name, email, phone, address, city, status } = clientData;

      const [result] = await pool.execute(
        "INSERT INTO clientes (id,name, email, phone, address, city, status, registrationDate) VALUES (?,?, ?, ?, ?, ?, ?, NOW())",
        [id, name, email, phone, address, city, status || "Activo"]
      );

      // Obtener el cliente recién creado
      const newClient = await this.findById(result.insertId);
      return newClient;
    } catch (error) {
      console.error("Error en Client.create:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("El email ya está registrado");
      }
      throw new Error("Error al crear cliente");
    }
  }

  /**
   * Actualiza un cliente existente
   * @param {number} id - ID del cliente
   * @param {Object} clientData - Datos a actualizar
   * @returns {Promise<Object|null>} Cliente actualizado o null
   */
  static async update(id, clientData) {
    try {
      const { name, email, phone, address, city, status } = clientData;

      const [result] = await pool.execute(
        "UPDATE clientes SET name = ?, email = ?, phone = ?, address = ?, city = ?, status = ? WHERE id = ?",
        [name, email, phone, address, city, status, id]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      // Obtener el cliente actualizado
      const updatedClient = await this.findById(id);
      return updatedClient;
    } catch (error) {
      console.error("Error en Client.update:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("El email ya está registrado");
      }
      throw new Error("Error al actualizar cliente");
    }
  }

  /**
   * Elimina un cliente por su ID
   * @param {number} id - ID del cliente
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute("DELETE FROM clientes WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en Client.delete:", error);
      throw new Error("Error al eliminar cliente");
    }
  }

  /**
   * Busca clientes por nombre, email o teléfono (búsqueda parcial)
   * @param {string} searchTerm - Término a buscar
   * @returns {Promise<Array>} Array de clientes encontrados
   */
  static async searchByName(searchTerm) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, email, phone, address, city, registrationDate, status FROM clientes WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY name",
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error("Error en Client.searchByName:", error);
      throw new Error("Error al buscar clientes por nombre");
    }
  }

  /**
   * Cuenta el total de clientes
   * @returns {Promise<number>} Número total de clientes
   */
  static async count() {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) as total FROM clientes"
      );
      return rows[0].total;
    } catch (error) {
      console.error("Error en Client.count:", error);
      throw new Error("Error al contar clientes");
    }
  }

  /**
   * Obtiene clientes con paginación
   * @param {number} page - Número de página (empezando en 1)
   * @param {number} limit - Límite de clientes por página
   * @returns {Promise<Object>} Objeto con clientes y metadatos de paginación
   */
  static async paginate(page = 1, limit = 10) {
    try {
      const pageInt = parseInt(page) || 1;
      let limitInt = parseInt(limit) || 10;
      const offset = (pageInt - 1) * limitInt;

      // Validar parámetros
      if (limitInt < 1) limitInt = 10;
      if (limitInt > 100) limitInt = 100; // Límite máximo

      // Obtener clientes paginados
      const [clients] = await pool.execute(
        `SELECT id, name, email, phone, address, city, registrationDate, status 
         FROM clientes 
         ORDER BY registrationDate DESC 
         LIMIT ${limitInt} OFFSET ${offset}`
      );

      // Obtener total de clientes
      const total = await this.count();
      const totalPages = Math.ceil(total / limitInt);

      return {
        clients,
        pagination: {
          currentPage: pageInt,
          totalPages,
          totalClients: total,
          hasNextPage: pageInt < totalPages,
          hasPrevPage: pageInt > 1,
          limit: limitInt,
        },
      };
    } catch (error) {
      console.error("Error en Client.paginate:", error);
      console.error("Detalles del error:", error.stack);
      throw new Error("Error al paginar clientes");
    }
  }
}

module.exports = Client;
