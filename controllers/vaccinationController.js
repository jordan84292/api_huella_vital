const Vaccination = require("../models/Vaccination");
const { validationResult } = require("express-validator");

class VaccinationController {
  static async getAllVaccinations(req, res) {
    try {
      const vaccinations = await Vaccination.findAll();
      res.status(200).json({
        success: true,
        message: "Vacunaciones obtenidas correctamente",
        data: vaccinations,
      });
    } catch (error) {
      console.error("Error en getAllVaccinations:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getVaccinationById(req, res) {
    try {
      const { id } = req.params;
      const vaccination = await Vaccination.findById(id);

      if (!vaccination) {
        return res.status(404).json({
          success: false,
          message: "Vacunación no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Vacunación obtenida correctamente",
        data: vaccination,
      });
    } catch (error) {
      console.error("Error en getVaccinationById:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getVaccinationsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      const vaccinations = await Vaccination.findByPatientId(patientId);

      res.status(200).json({
        success: true,
        message: "Vacunaciones del paciente obtenidas correctamente",
        data: vaccinations,
        count: vaccinations.length,
      });
    } catch (error) {
      console.error("Error en getVaccinationsByPatient:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getUpcomingVaccinations(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const vaccinations = await Vaccination.getUpcoming(days);

      res.status(200).json({
        success: true,
        message: "Vacunaciones próximas obtenidas correctamente",
        data: vaccinations,
        count: vaccinations.length,
      });
    } catch (error) {
      console.error("Error en getUpcomingVaccinations:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getOverdueVaccinations(req, res) {
    try {
      const vaccinations = await Vaccination.getOverdue();

      res.status(200).json({
        success: true,
        message: "Vacunaciones vencidas obtenidas correctamente",
        data: vaccinations,
        count: vaccinations.length,
      });
    } catch (error) {
      console.error("Error en getOverdueVaccinations:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async createVaccination(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }
      console.log(req.body);

      const newVaccination = await Vaccination.create(req.body);

      res.status(201).json({
        success: true,
        message: "Vacunación creada correctamente",
        data: newVaccination,
      });
    } catch (error) {
      console.error("Error en createVaccination:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async updateVaccination(req, res) {
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
      const updatedVaccination = await Vaccination.update(id, req.body);

      if (!updatedVaccination) {
        return res.status(404).json({
          success: false,
          message: "Vacunación no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Vacunación actualizada correctamente",
        data: updatedVaccination,
      });
    } catch (error) {
      console.error("Error en updateVaccination:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async deleteVaccination(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Vaccination.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Vacunación no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Vacunación eliminada correctamente",
      });
    } catch (error) {
      console.error("Error en deleteVaccination:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getVaccinationStats(req, res) {
    try {
      const total = await Vaccination.count();
      const upcoming = await Vaccination.getUpcoming(30);
      const overdue = await Vaccination.getOverdue();

      res.status(200).json({
        success: true,
        message: "Estadísticas obtenidas correctamente",
        data: {
          totalVaccinations: total,
          upcomingCount: upcoming.length,
          overdueCount: overdue.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error en getVaccinationStats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

module.exports = VaccinationController;
