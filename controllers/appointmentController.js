const Appointment = require("../models/appointment");
const { validationResult } = require("express-validator");

class AppointmentController {
  static async getAllAppointments(req, res) {
    try {
      const appointments = await Appointment.findAll();
      res.status(200).json({
        success: true,
        message: "Citas obtenidas correctamente",
        data: appointments,
      });
    } catch (error) {
      console.error("Error en getAllAppointments:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getAppointmentById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Cita no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Cita obtenida correctamente",
        data: appointment,
      });
    } catch (error) {
      console.error("Error en getAppointmentById:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getAppointmentsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      const appointments = await Appointment.findByPatientId(patientId);

      res.status(200).json({
        success: true,
        message: "Citas del paciente obtenidas correctamente",
        data: appointments,
        count: appointments.length,
      });
    } catch (error) {
      console.error("Error en getAppointmentsByPatient:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getAppointmentsByDate(req, res) {
    try {
      const { date } = req.params;
      const appointments = await Appointment.findByDate(date);

      res.status(200).json({
        success: true,
        message: "Citas de la fecha obtenidas correctamente",
        data: appointments,
        count: appointments.length,
      });
    } catch (error) {
      console.error("Error en getAppointmentsByDate:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getAppointmentsByStatus(req, res) {
    try {
      const { status } = req.params;
      const appointments = await Appointment.findByStatus(status);

      res.status(200).json({
        success: true,
        message: "Citas por estado obtenidas correctamente",
        data: appointments,
        count: appointments.length,
      });
    } catch (error) {
      console.error("Error en getAppointmentsByStatus:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async createAppointment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const newAppointment = await Appointment.create(req.body);

      res.status(201).json({
        success: true,
        message: "Cita creada correctamente",
        data: newAppointment,
      });
    } catch (error) {
      console.error("Error en createAppointment:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async updateAppointment(req, res) {
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
      const updatedAppointment = await Appointment.update(id, req.body);

      if (!updatedAppointment) {
        return res.status(404).json({
          success: false,
          message: "Cita no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Cita actualizada correctamente",
        data: updatedAppointment,
      });
    } catch (error) {
      console.error("Error en updateAppointment:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async deleteAppointment(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Appointment.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Cita no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Cita eliminada correctamente",
      });
    } catch (error) {
      console.error("Error en deleteAppointment:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getAppointmentStats(req, res) {
    try {
      const total = await Appointment.count();
      const byType = await Appointment.getStatsByType();
      const byStatus = await Appointment.getStatsByStatus();

      // Obtener fecha actual
      const today = new Date().toISOString().split("T")[0];
      const todayCount = await Appointment.countByDate(today);

      res.status(200).json({
        success: true,
        message: "Estadísticas obtenidas correctamente",
        data: {
          totalAppointments: total,
          todayAppointments: todayCount,
          byType,
          byStatus,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error en getAppointmentStats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

module.exports = AppointmentController;
