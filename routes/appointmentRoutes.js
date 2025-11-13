const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointmentController");
const {
  validateAppointment,
  validateAppointmentId,
  handleValidationErrors,
} = require("../middleware/validation");

/**
 * @route GET /appointments/stats
 * @description Obtiene estadísticas de citas
 */
router.get("/stats", AppointmentController.getAppointmentStats);

/**
 * @route GET /appointments/patient/:patientId
 * @description Obtiene todas las citas de un paciente
 */
router.get(
  "/patient/:patientId",
  AppointmentController.getAppointmentsByPatient
);

/**
 * @route GET /appointments/date/:date
 * @description Obtiene todas las citas de una fecha específica
 */
router.get("/date/:date", AppointmentController.getAppointmentsByDate);

/**
 * @route GET /appointments/status/:status
 * @description Obtiene todas las citas por estado (Programada, Completada, Cancelada)
 */
router.get("/status/:status", AppointmentController.getAppointmentsByStatus);

/**
 * @route GET /appointments
 * @description Obtiene todas las citas
 */
router.get("/", AppointmentController.getAllAppointments);

/**
 * @route GET /appointments/:id
 * @description Obtiene una cita específica por ID
 */
router.get(
  "/:id",
  validateAppointmentId,
  handleValidationErrors,
  AppointmentController.getAppointmentById
);

/**
 * @route POST /appointments
 * @description Crea una nueva cita
 */
router.post(
  "/",
  validateAppointment,
  handleValidationErrors,
  AppointmentController.createAppointment
);

/**
 * @route PUT /appointments/:id
 * @description Actualiza una cita existente
 */
router.put(
  "/:id",
  validateAppointmentId,
  validateAppointment,
  handleValidationErrors,
  AppointmentController.updateAppointment
);

/**
 * @route DELETE /appointments/:id
 * @description Elimina una cita
 */
router.delete(
  "/:id",
  validateAppointmentId,
  handleValidationErrors,
  AppointmentController.deleteAppointment
);

module.exports = router;
