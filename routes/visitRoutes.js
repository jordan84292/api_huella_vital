const express = require("express");
const router = express.Router();
const VisitController = require("../controllers/visitController");
const {
  validateVisit,
  validateVisitId,
  handleValidationErrors,
} = require("../middleware/validation");

/**
 * @route GET /visits/stats
 * @description Obtiene estadísticas de visitas
 */
router.get("/stats", VisitController.getVisitStats);

/**
 * @route GET /visits/patient/:patientId
 * @description Obtiene todas las visitas de un paciente
 */
router.get("/patient/:patientId", VisitController.getVisitsByPatient);

/**
 * @route GET /visits
 * @description Obtiene todas las visitas
 */
router.get("/", VisitController.getAllVisits);

/**
 * @route GET /visits/:id
 * @description Obtiene una visita específica por ID
 */
router.get(
  "/:id",
  validateVisitId,
  handleValidationErrors,
  VisitController.getVisitById
);

/**
 * @route POST /visits
 * @description Crea una nueva visita
 */
router.post(
  "/",
  validateVisit,
  handleValidationErrors,
  VisitController.createVisit
);

/**
 * @route PUT /visits/:id
 * @description Actualiza una visita existente
 */
router.put(
  "/:id",
  validateVisitId,
  validateVisit,
  handleValidationErrors,
  VisitController.updateVisit
);

/**
 * @route DELETE /visits/:id
 * @description Elimina una visita
 */
router.delete(
  "/:id",
  validateVisitId,
  handleValidationErrors,
  VisitController.deleteVisit
);

module.exports = router;
