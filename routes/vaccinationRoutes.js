const express = require("express");
const router = express.Router();
const VaccinationController = require("../controllers/vaccinationController");
const {
  validateVaccination,
  validateVaccinationId,
  handleValidationErrors,
} = require("../middleware/validation");

router.get("/stats", VaccinationController.getVaccinationStats);
router.get("/upcoming", VaccinationController.getUpcomingVaccinations);
router.get("/overdue", VaccinationController.getOverdueVaccinations);
router.get(
  "/patient/:patientId",
  VaccinationController.getVaccinationsByPatient
);
router.get("/", VaccinationController.getAllVaccinations);
router.get(
  "/:id",
  validateVaccinationId,
  handleValidationErrors,
  VaccinationController.getVaccinationById
);
router.post(
  "/",
  validateVaccination,
  handleValidationErrors,
  VaccinationController.createVaccination
);
router.put(
  "/:id",
  validateVaccinationId,
  validateVaccination,
  handleValidationErrors,
  VaccinationController.updateVaccination
);
router.delete(
  "/:id",
  validateVaccinationId,
  handleValidationErrors,
  VaccinationController.deleteVaccination
);

module.exports = router;
