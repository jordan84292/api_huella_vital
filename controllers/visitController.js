const Visit = require("../models/Visit");
const { validationResult } = require("express-validator");

class VisitController {
  static async getAllVisits(req, res) {
    try {
      const visits = await Visit.findAll();
      res.status(200).json({
        success: true,
        message: "Visitas obtenidas correctamente",
        data: visits,
      });
    } catch (error) {
      console.error("Error en getAllVisits:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getVisitById(req, res) {
    try {
      const { id } = req.params;
      const visit = await Visit.findById(id);

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: "Visita no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Visita obtenida correctamente",
        data: visit,
      });
    } catch (error) {
      console.error("Error en getVisitById:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getVisitsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      const visits = await Visit.findByPatientId(patientId);

      res.status(200).json({
        success: true,
        message: "Visitas del paciente obtenidas correctamente",
        data: visits,
        count: visits.length,
      });
    } catch (error) {
      console.error("Error en getVisitsByPatient:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async createVisit(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const newVisit = await Visit.create(req.body);

      res.status(201).json({
        success: true,
        message: "Visita creada correctamente",
        data: newVisit,
      });
    } catch (error) {
      console.error("Error en createVisit:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async updateVisit(req, res) {
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
      const updatedVisit = await Visit.update(id, req.body);

      if (!updatedVisit) {
        return res.status(404).json({
          success: false,
          message: "Visita no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Visita actualizada correctamente",
        data: updatedVisit,
      });
    } catch (error) {
      console.error("Error en updateVisit:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async deleteVisit(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Visit.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Visita no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Visita eliminada correctamente",
      });
    } catch (error) {
      console.error("Error en deleteVisit:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getVisitStats(req, res) {
    try {
      const total = await Visit.count();
      const byType = await Visit.getStatsByType();

      res.status(200).json({
        success: true,
        message: "Estadísticas obtenidas correctamente",
        data: {
          totalVisits: total,
          byType,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error en getVisitStats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

module.exports = VisitController;
