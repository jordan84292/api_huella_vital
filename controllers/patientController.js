const Patient = require("../models/Patient");
const { validationResult } = require("express-validator");
const { pool } = require("../config/database");

class PatientController {
  /**
   * Obtiene todos los pacientes con paginación opcional
   */
  static async getAllPatients(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search;

      let result;

      if (search) {
        const patients = await Patient.searchByName(search);
        result = {
          patients,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalPatients: patients.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      } else {
        result = await Patient.paginate(page, limit);
      }

      res.status(200).json({
        success: true,
        message: "Pacientes obtenidos correctamente",
        data: result.patients,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error en getAllPatients:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene un paciente por su ID
   */
  static async getPatientById(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "El ID debe ser un número válido",
        });
      }

      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Paciente no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Paciente obtenido correctamente",
        data: patient,
      });
    } catch (error) {
      console.error("Error en getPatientById:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene pacientes por dueño
   */
  static async getPatientsByOwner(req, res) {
    try {
      const { ownerId } = req.params;

      if (isNaN(ownerId)) {
        return res.status(400).json({
          success: false,
          message: "El ID del dueño debe ser un número válido",
        });
      }

      const patients = await Patient.findByOwnerId(ownerId);

      res.status(200).json({
        success: true,
        message: "Pacientes obtenidos correctamente",
        data: patients,
        count: patients.length,
      });
    } catch (error) {
      console.error("Error en getPatientsByOwner:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Crea un nuevo paciente
   */
  static async createPatient(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

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
      } = req.body;

      // Verificar que el propietario existe
      const [ownerExists] = await pool.execute(
        "SELECT id FROM clientes WHERE id = ?",
        [ownerId]
      );

      if (ownerExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El propietario seleccionado no existe",
          field: "ownerId",
        });
      }

      // Verificar si el microchip ya existe (si se proporciona)
      if (microchip) {
        const existingPatient = await Patient.findByMicrochip(microchip);
        if (existingPatient) {
          return res.status(409).json({
            success: false,
            message: "El microchip ya está registrado",
          });
        }
      }

      const newPatient = await Patient.create({
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
      });

      res.status(201).json({
        success: true,
        message: "Paciente creado correctamente",
        data: newPatient,
      });
    } catch (error) {
      console.error("Error en createPatient:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Actualiza un paciente existente
   */
  static async updatePatient(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
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
      } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "El ID debe ser un número válido",
        });
      }

      const existingPatient = await Patient.findById(id);
      if (!existingPatient) {
        return res.status(404).json({
          success: false,
          message: "Paciente no encontrado",
        });
      }

      // Verificar que el propietario existe
      const [ownerExists] = await pool.execute(
        "SELECT id FROM clientes WHERE id = ?",
        [ownerId]
      );

      if (ownerExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El propietario seleccionado no existe",
          field: "ownerId",
        });
      }

      // Verificar si el microchip ya existe en otro paciente
      if (microchip && microchip !== existingPatient.microchip) {
        const microchipPatient = await Patient.findByMicrochip(microchip);
        if (microchipPatient && microchipPatient.id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            message: "El microchip ya está registrado en otro paciente",
          });
        }
      }

      const updatedPatient = await Patient.update(id, {
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
      });

      res.status(200).json({
        success: true,
        message: "Paciente actualizado correctamente",
        data: updatedPatient,
      });
    } catch (error) {
      console.error("Error en updatePatient:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Elimina un paciente
   */
  static async deletePatient(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "El ID debe ser un número válido",
        });
      }

      const existingPatient = await Patient.findById(id);
      if (!existingPatient) {
        return res.status(404).json({
          success: false,
          message: "Paciente no encontrado",
        });
      }

      await Patient.delete(id);

      res.status(200).json({
        success: true,
        message: "Paciente eliminado correctamente",
      });
    } catch (error) {
      console.error("Error en deletePatient:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Busca pacientes por nombre
   */
  static async searchPatients(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "El parámetro de búsqueda es requerido",
        });
      }

      const patients = await Patient.searchByName(q.trim());

      res.status(200).json({
        success: true,
        message: "Búsqueda completada",
        data: patients,
        count: patients.length,
      });
    } catch (error) {
      console.error("Error en searchPatients:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene estadísticas de pacientes
   */
  static async getPatientStats(req, res) {
    try {
      const total = await Patient.count();
      const bySpecies = await Patient.getStatsBySpecies();
      const byStatus = await Patient.getStatsByStatus();

      res.status(200).json({
        success: true,
        message: "Estadísticas obtenidas correctamente",
        data: {
          totalPatients: total,
          bySpecies,
          byStatus,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error en getPatientStats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

module.exports = PatientController;
