const { pool } = require("../config/database");

class Vaccination {
  constructor(vaccinationData) {
    this.id = vaccinationData.id;
    this.patientId = vaccinationData.patientId;
    this.date = vaccinationData.date;
    this.vaccine = vaccinationData.vaccine;
    this.nextDue = vaccinationData.nextDue;
    this.veterinarian = vaccinationData.veterinarian;
    this.batchNumber = vaccinationData.batchNumber;
    this.notes = vaccinationData.notes;
    this.created_date = vaccinationData.created_date;
    this.updated_date = vaccinationData.updated_date;
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM vaccinations ORDER BY date DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error en Vaccination.findAll:", error);
      throw new Error("Error al obtener vacunaciones");
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM vaccinations WHERE id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Vaccination.findById:", error);
      throw new Error("Error al buscar vacunación por ID");
    }
  }

  static async findByPatientId(patientId) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM vaccinations WHERE patientId = ? ORDER BY date DESC`,
        [patientId]
      );
      return rows;
    } catch (error) {
      console.error("Error en Vaccination.findByPatientId:", error);
      throw new Error("Error al buscar vacunaciones por paciente");
    }
  }

  static async getUpcoming(days = 30) {
    try {
      const [rows] = await pool.execute(
        `SELECT v.*, p.name as patientName, p.species, c.name as ownerName, c.phone as ownerPhone
         FROM vaccinations v
         INNER JOIN patients p ON v.patientId = p.id
         INNER JOIN clients c ON p.ownerId = c.id
         WHERE v.nextDue BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
         ORDER BY v.nextDue ASC`,
        [days]
      );
      return rows;
    } catch (error) {
      console.error("Error en Vaccination.getUpcoming:", error);
      throw new Error("Error al obtener vacunaciones próximas");
    }
  }

  static async getOverdue() {
    try {
      const [rows] = await pool.execute(
        `SELECT v.*, p.name as patientName, p.species, c.name as ownerName, c.phone as ownerPhone,
         DATEDIFF(CURDATE(), v.nextDue) as daysOverdue
         FROM vaccinations v
         INNER JOIN patients p ON v.patientId = p.id
         INNER JOIN clients c ON p.ownerId = c.id
         WHERE v.nextDue < CURDATE()
         ORDER BY v.nextDue ASC`
      );
      return rows;
    } catch (error) {
      console.error("Error en Vaccination.getOverdue:", error);
      throw new Error("Error al obtener vacunaciones vencidas");
    }
  }

  static async create(vaccinationData) {
    try {
      const {
        patientId,
        date,
        vaccine,
        nextDue,
        veterinarian,
        batchNumber,
        notes,
      } = vaccinationData;

      const [result] = await pool.execute(
        `INSERT INTO vaccinations 
         (patientId, date, vaccine, nextDue, veterinarian, batchNumber, notes, created_date, updated_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          patientId,
          date,
          vaccine,
          nextDue,
          veterinarian,
          batchNumber,
          notes || null,
        ]
      );

      // Actualizar lastVisit del paciente si es más reciente
      await pool.execute(
        `UPDATE patients 
         SET lastVisit = CASE 
           WHEN lastVisit IS NULL OR ? > lastVisit THEN ? 
           ELSE lastVisit 
         END,
         updated_date = NOW()
         WHERE id = ?`,
        [date, date, patientId]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      console.error("Error en Vaccination.create:", error);
      throw new Error("Error al crear vacunación");
    }
  }

  static async update(id, vaccinationData) {
    try {
      const {
        patientId,
        date,
        vaccine,
        nextDue,
        veterinarian,
        batchNumber,
        notes,
      } = vaccinationData;

      const [result] = await pool.execute(
        `UPDATE vaccinations 
         SET patientId = ?, date = ?, vaccine = ?, nextDue = ?, 
             veterinarian = ?, batchNumber = ?, notes = ?, updated_date = NOW()
         WHERE id = ?`,
        [
          patientId,
          date,
          vaccine,
          nextDue,
          veterinarian,
          batchNumber,
          notes,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      console.error("Error en Vaccination.update:", error);
      throw new Error("Error al actualizar vacunación");
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM vaccinations WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en Vaccination.delete:", error);
      throw new Error("Error al eliminar vacunación");
    }
  }

  static async count() {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) as total FROM vaccinations"
      );
      return rows[0].total;
    } catch (error) {
      console.error("Error en Vaccination.count:", error);
      throw new Error("Error al contar vacunaciones");
    }
  }
}

module.exports = Vaccination;
