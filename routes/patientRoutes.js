const express = require("express");
const router = express.Router();
const PatientController = require("../controllers/patientController");
const {
  validatePatient,
  validatePatientId,
  handleValidationErrors,
} = require("../middleware/validation");

/**
 * @route GET /patients/search
 * @description Busca pacientes por nombre
 */
router.get("/search", PatientController.searchPatients);

/**
 * @route GET /patients/stats
 * @description Obtiene estadísticas de pacientes
 */
router.get("/stats", PatientController.getPatientStats);

/**
 * @route GET /patients/owner/:ownerId
 * @description Obtiene todos los pacientes de un dueño específico
 */
router.get("/owner/:ownerId", PatientController.getPatientsByOwner);

/**
 * @route GET /patients
 * @description Obtiene todos los pacientes con paginación opcional
 */
router.get("/", PatientController.getAllPatients);

/**
 * @route GET /patients/:id
 * @description Obtiene un paciente específico por ID
 */
router.get(
  "/:id",
  validatePatientId,
  handleValidationErrors,
  PatientController.getPatientById
);

/**
 * @route POST /patients
 * @description Crea un nuevo paciente
 */
router.post(
  "/",
  validatePatient,
  handleValidationErrors,
  PatientController.createPatient
);

/**
 * @route PUT /patients/:id
 * @description Actualiza un paciente existente
 */
router.put(
  "/:id",
  validatePatientId,
  validatePatient,
  handleValidationErrors,
  PatientController.updatePatient
);

/**
 * @route DELETE /patients/:id
 * @description Elimina un paciente
 */
router.delete(
  "/:id",
  validatePatientId,
  handleValidationErrors,
  PatientController.deletePatient
);

module.exports = router;
