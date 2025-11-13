const { pool } = require("../config/database");

/**
 * Clase que representa el modelo de Paciente
 */
class Patient {
  /**
   * Constructor para crear una instancia de Paciente
   * @param {Object} patientData - Datos del paciente
   */
  constructor(patientData) {
    this.id = patientData.id;
    this.name = patientData.name;
    this.species = patientData.species;
    this.breed = patientData.breed;
    this.age = patientData.age;
    this.weight = patientData.weight;
    this.gender = patientData.gender;
    this.birthDate = patientData.birthDate;
    this.ownerId = patientData.ownerId;
    this.lastVisit = patientData.lastVisit;
    this.nextVisit = patientData.nextVisit;
    this.microchip = patientData.microchip;
    this.color = patientData.color;
    this.allergies = patientData.allergies;
    this.status = patientData.status;
    this.created_date = patientData.created_date;
    this.updated_date = patientData.updated_date;
  }

  /**
   * Obtiene todos los pacientes de la base de datos
   * @returns {Promise<Array>} Array de pacientes
   */
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, species, breed, age, weight, gender, birthDate, 
         ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
         created_date, updated_date 
         FROM patients 
         ORDER BY created_date DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error en Patient.findAll:", error);
      throw new Error("Error al obtener pacientes");
    }
  }

  /**
   * Busca un paciente por su ID
   * @param {number} id - ID del paciente
   * @returns {Promise<Object|null>} Paciente encontrado o null
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, species, breed, age, weight, gender, birthDate, 
         ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
         created_date, updated_date 
         FROM patients 
         WHERE id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Patient.findById:", error);
      throw new Error("Error al buscar paciente por ID");
    }
  }

  /**
   * Busca pacientes por dueño
   * @param {number} ownerId - ID del dueño
   * @returns {Promise<Array>} Array de pacientes
   */
  static async findByOwnerId(ownerId) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, species, breed, age, weight, gender, birthDate, 
         ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
         created_date, updated_date 
         FROM patients 
         WHERE ownerId = ?
         ORDER BY name`,
        [ownerId]
      );
      return rows;
    } catch (error) {
      console.error("Error en Patient.findByOwnerId:", error);
      throw new Error("Error al buscar pacientes por dueño");
    }
  }

  /**
   * Busca un paciente por microchip
   * @param {string} microchip - Número de microchip
   * @returns {Promise<Object|null>} Paciente encontrado o null
   */
  static async findByMicrochip(microchip) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, species, breed, age, weight, gender, birthDate, 
         ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
         created_date, updated_date 
         FROM patients 
         WHERE microchip = ?`,
        [microchip]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Patient.findByMicrochip:", error);
      throw new Error("Error al buscar paciente por microchip");
    }
  }

  /**
   * Crea un nuevo paciente en la base de datos
   * @param {Object} patientData - Datos del paciente
   * @returns {Promise<Object>} Paciente creado
   */
  static async create(patientData) {
    try {
      const {
        name,
        species,
        breed,
        age,
        weight,
        gender,
        birthDate,
        ownerId,
        nextVisit,
        microchip,
        color,
        allergies,
        status,
      } = patientData;

      const [result] = await pool.execute(
        `INSERT INTO patients 
         (name, species, breed, age, weight, gender, birthDate, ownerId,lastVisit, nextVisit, microchip, color, allergies, status, 
          created_date, updated_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?,NOW(), ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          name,
          species,
          breed,
          age,
          weight,
          gender,
          birthDate || null,
          ownerId,
          nextVisit || null,
          microchip || null,
          color || null,
          allergies || null,
          status || "Activo",
        ]
      );

      const newPatient = await this.findById(result.insertId);
      return newPatient;
    } catch (error) {
      console.error("Error en Patient.create:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("El microchip ya está registrado");
      }
      throw new Error("Error al crear paciente");
    }
  }

  /**
   * Actualiza un paciente existente
   * @param {number} id - ID del paciente
   * @param {Object} patientData - Datos a actualizar
   * @returns {Promise<Object|null>} Paciente actualizado o null
   */
  static async update(id, patientData) {
    try {
      const {
        name,
        species,
        breed,
        age,
        weight,
        gender,
        birthDate,
        ownerId,
        lastVisit,
        nextVisit,
        microchip,
        color,
        allergies,
        status,
      } = patientData;

      const [result] = await pool.execute(
        `UPDATE patients 
         SET name = ?, species = ?, breed = ?, age = ?, weight = ?, 
             gender = ?, birthDate = ?, ownerId = ?, lastVisit = ?, 
             nextVisit = ?, microchip = ?, color = ?, allergies = ?, 
             status = ?, updated_date = NOW()
         WHERE id = ?`,
        [
          name,
          species,
          breed,
          age,
          weight,
          gender,
          birthDate || null,
          ownerId,
          lastVisit || null,
          nextVisit || null,
          microchip || null,
          color || null,
          allergies || null,
          status,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      const updatedPatient = await this.findById(id);
      return updatedPatient;
    } catch (error) {
      console.error("Error en Patient.update:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("El microchip ya está registrado");
      }
      throw new Error("Error al actualizar paciente");
    }
  }

  /**
   * Elimina un paciente por su ID
   * @param {number} id - ID del paciente
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute("DELETE FROM patients WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en Patient.delete:", error);
      throw new Error("Error al eliminar paciente");
    }
  }

  /**
   * Busca pacientes por nombre (búsqueda parcial)
   * @param {string} name - Nombre a buscar
   * @returns {Promise<Array>} Array de pacientes encontrados
   */
  static async searchByName(name) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, species, breed, age, weight, gender, birthDate, 
         ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
         created_date, updated_date 
         FROM patients 
         WHERE name LIKE ? 
         ORDER BY name`,
        [`%${name}%`]
      );
      return rows;
    } catch (error) {
      console.error("Error en Patient.searchByName:", error);
      throw new Error("Error al buscar pacientes por nombre");
    }
  }

  /**
   * Cuenta el total de pacientes
   * @returns {Promise<number>} Número total de pacientes
   */
  static async count() {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) as total FROM patients"
      );
      return rows[0].total;
    } catch (error) {
      console.error("Error en Patient.count:", error);
      throw new Error("Error al contar pacientes");
    }
  }

  /**
   * Obtiene pacientes con paginación
   * @param {number} page - Número de página (empezando en 1)
   * @param {number} limit - Límite de pacientes por página
   * @returns {Promise<Object>} Objeto con pacientes y metadatos de paginación
   */
  static async paginate(page = 1, limit = 10) {
    try {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;
      const offset = (pageInt - 1) * limitInt;

      const [patients] = await pool.execute(
        `SELECT id, name, species, breed, age, weight, gender, birthDate, 
         ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
         created_date, updated_date 
         FROM patients 
         ORDER BY created_date DESC 
         LIMIT ${limitInt} OFFSET ${offset}`
      );

      const total = await this.count();
      const totalPages = Math.ceil(total / limitInt);

      return {
        patients,
        pagination: {
          currentPage: pageInt,
          totalPages,
          totalPatients: total,
          hasNextPage: pageInt < totalPages,
          hasPrevPage: pageInt > 1,
          limit: limitInt,
        },
      };
    } catch (error) {
      console.error("Error en Patient.paginate:", error);
      throw new Error("Error al paginar pacientes");
    }
  }

  /**
   * Obtiene estadísticas de pacientes por especie
   * @returns {Promise<Array>} Estadísticas por especie
   */
  static async getStatsBySpecies() {
    try {
      const [rows] = await pool.execute(
        `SELECT species, COUNT(*) as count 
         FROM patients 
         GROUP BY species 
         ORDER BY count DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error en Patient.getStatsBySpecies:", error);
      throw new Error("Error al obtener estadísticas por especie");
    }
  }

  /**
   * Obtiene estadísticas de pacientes por status
   * @returns {Promise<Array>} Estadísticas por status
   */
  static async getStatsByStatus() {
    try {
      const [rows] = await pool.execute(
        `SELECT status, COUNT(*) as count 
         FROM patients 
         GROUP BY status 
         ORDER BY count DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error en Patient.getStatsByStatus:", error);
      throw new Error("Error al obtener estadísticas por status");
    }
  }
}

module.exports = Patient;
