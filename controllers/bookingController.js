// controllers/bookingController.js
const Booking = require("../models/Booking");
const { validationResult } = require("express-validator");

class BookingController {
  /**
   * Obtiene todos los slots (disponibles y ocupados) para un veterinario en una fecha
   */
  static async getAllSlots(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { veterinarian, date } = req.query;

      const slots = await Booking.getAllSlots(veterinarian, date);

      res.status(200).json({
        success: true,
        message: "Slots obtenidos correctamente",
        data: {
          veterinarian,
          date,
          slots,
          total: slots.length,
          available: slots.filter((s) => s.is_available).length,
          occupied: slots.filter((s) => !s.is_available).length,
        },
      });
    } catch (error) {
      console.error("Error en getAllSlots:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene solo los slots disponibles para un veterinario en una fecha
   */
  static async getAvailableSlots(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { veterinarian, date } = req.query;

      const availableSlots = await Booking.getAvailableSlots(
        veterinarian,
        date,
      );

      res.status(200).json({
        success: true,
        message: "Slots disponibles obtenidos correctamente",
        data: {
          veterinarian,
          date,
          availableSlots,
          count: availableSlots.length,
        },
      });
    } catch (error) {
      console.error("Error en getAvailableSlots:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Verifica si un slot específico está disponible
   */
  static async checkSlotAvailability(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { veterinarian, date, time } = req.query;

      const isAvailable = await Booking.isSlotAvailable(
        veterinarian,
        date,
        time,
      );

      res.status(200).json({
        success: true,
        message: "Disponibilidad verificada",
        data: {
          veterinarian,
          date,
          time,
          isAvailable,
        },
      });
    } catch (error) {
      console.error("Error en checkSlotAvailability:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene estadísticas de disponibilidad para un día
   */
  static async getDayStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { veterinarian, date } = req.query;

      const stats = await Booking.getDayStats(veterinarian, date);

      res.status(200).json({
        success: true,
        message: "Estadísticas obtenidas correctamente",
        data: stats,
      });
    } catch (error) {
      console.error("Error en getDayStats:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene disponibilidad para un rango de fechas
   */
  static async getMultipleDaysAvailability(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { veterinarian, startDate, endDate } = req.query;

      const availability = await Booking.getMultipleDaysAvailability(
        veterinarian,
        startDate,
        endDate,
      );

      res.status(200).json({
        success: true,
        message: "Disponibilidad obtenida correctamente",
        data: {
          veterinarian,
          startDate,
          endDate,
          days: availability,
          totalDays: availability.length,
        },
      });
    } catch (error) {
      console.error("Error en getMultipleDaysAvailability:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene los horarios de negocio configurados
   */
  static async getBusinessHours(req, res) {
    try {
      const businessHours = await Booking.getBusinessHours();

      res.status(200).json({
        success: true,
        message: "Horarios de negocio obtenidos correctamente",
        data: businessHours,
      });
    } catch (error) {
      console.error("Error en getBusinessHours:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene los bloques de tiempo (desayunos, almuerzos)
   */
  static async getTimeBlocks(req, res) {
    try {
      const timeBlocks = await Booking.getTimeBlocks();

      res.status(200).json({
        success: true,
        message: "Bloques de tiempo obtenidos correctamente",
        data: timeBlocks,
      });
    } catch (error) {
      console.error("Error en getTimeBlocks:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

module.exports = BookingController;
