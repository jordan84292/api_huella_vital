// routes/booking.js
const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/bookingController");
const { query } = require("express-validator");

// Validaciones
const validateBookingQuery = [
  query("veterinarian")
    .notEmpty()
    .withMessage("El nombre del veterinario es requerido")
    .isString()
    .withMessage("El nombre del veterinario debe ser un texto"),
  query("date")
    .notEmpty()
    .withMessage("La fecha es requerida")
    .isISO8601()
    .withMessage("La fecha debe estar en formato ISO 8601 (YYYY-MM-DD)"),
];

const validateSlotCheck = [
  ...validateBookingQuery,
  query("time")
    .notEmpty()
    .withMessage("La hora es requerida")
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("La hora debe estar en formato HH:MM:SS"),
];

const validateDateRange = [
  query("veterinarian")
    .notEmpty()
    .withMessage("El nombre del veterinario es requerido")
    .isString()
    .withMessage("El nombre del veterinario debe ser un texto"),
  query("startDate")
    .notEmpty()
    .withMessage("La fecha inicial es requerida")
    .isISO8601()
    .withMessage(
      "La fecha inicial debe estar en formato ISO 8601 (YYYY-MM-DD)",
    ),
  query("endDate")
    .notEmpty()
    .withMessage("La fecha final es requerida")
    .isISO8601()
    .withMessage("La fecha final debe estar en formato ISO 8601 (YYYY-MM-DD)"),
];

/**
 * @route GET /booking/business-hours
 * @description Obtiene los horarios de negocio configurados
 */
router.get("/business-hours", BookingController.getBusinessHours);

/**
 * @route GET /booking/time-blocks
 * @description Obtiene los bloques de tiempo (desayunos, almuerzos)
 */
router.get("/time-blocks", BookingController.getTimeBlocks);

/**
 * @route GET /booking/slots/all
 * @description Obtiene todos los slots (disponibles y ocupados)
 * @query veterinarian, date
 */
router.get("/slots/all", validateBookingQuery, BookingController.getAllSlots);

/**
 * @route GET /booking/slots/available
 * @description Obtiene solo los slots disponibles
 * @query veterinarian, date
 */
router.get(
  "/slots/available",
  validateBookingQuery,
  BookingController.getAvailableSlots,
);

/**
 * @route GET /booking/check
 * @description Verifica si un slot específico está disponible
 * @query veterinarian, date, time
 */
router.get(
  "/check",
  validateSlotCheck,
  BookingController.checkSlotAvailability,
);

/**
 * @route GET /booking/stats
 * @description Obtiene estadísticas de disponibilidad para un día
 * @query veterinarian, date
 */
router.get("/stats", validateBookingQuery, BookingController.getDayStats);

/**
 * @route GET /booking/availability/range
 * @description Obtiene disponibilidad para un rango de fechas
 * @query veterinarian, startDate, endDate
 */
router.get(
  "/availability/range",
  validateDateRange,
  BookingController.getMultipleDaysAvailability,
);

module.exports = router;
