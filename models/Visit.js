const { pool } = require("../config/database");

class Visit {
  constructor(visitData) {
    this.id = visitData.id;
    this.patientId = visitData.patientId;
    this.date = visitData.date;
    this.type = visitData.type;
    this.veterinarian = visitData.veterinarian;
    this.diagnosis = visitData.diagnosis;
    this.treatment = visitData.treatment;
    this.notes = visitData.notes;
    this.cost = visitData.cost;
    this.created_date = visitData.created_date;
    this.updated_date = visitData.updated_date;
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM visits ORDER BY date DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error en Visit.findAll:", error);
      throw new Error("Error al obtener visitas");
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(`SELECT * FROM visits WHERE id = ?`, [
        id,
      ]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Visit.findById:", error);
      throw new Error("Error al buscar visita por ID");
    }
  }

  static async findByPatientId(patientId) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM visits WHERE patientId = ? ORDER BY date DESC`,
        [patientId]
      );
      return rows;
    } catch (error) {
      console.error("Error en Visit.findByPatientId:", error);
      throw new Error("Error al buscar visitas por paciente");
    }
  }

  static async create(visitData) {
    try {
      const {
        patientId,
        date,
        type,
        veterinarian,
        diagnosis,
        treatment,
        notes,
        cost,
      } = visitData;

      const [result] = await pool.execute(
        `INSERT INTO visits 
         (patientId, date, type, veterinarian, diagnosis, treatment, notes, cost, created_date, updated_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          patientId,
          date,
          type,
          veterinarian,
          diagnosis,
          treatment,
          notes || null,
          cost,
        ]
      );

      // Actualizar lastVisit del paciente
      await pool.execute(
        `UPDATE patients SET lastVisit = DATE(?), updated_date = NOW() WHERE id = ?`,
        [date, patientId]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      console.error("Error en Visit.create:", error);
      throw new Error("Error al crear visita");
    }
  }

  static async update(id, visitData) {
    try {
      const {
        patientId,
        date,
        type,
        veterinarian,
        diagnosis,
        treatment,
        notes,
        cost,
      } = visitData;

      const [result] = await pool.execute(
        `UPDATE visits 
         SET patientId = ?, date = ?, type = ?, veterinarian = ?, 
             diagnosis = ?, treatment = ?, notes = ?, cost = ?, updated_date = NOW()
         WHERE id = ?`,
        [
          patientId,
          date,
          type,
          veterinarian,
          diagnosis,
          treatment,
          notes,
          cost,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      console.error("Error en Visit.update:", error);
      throw new Error("Error al actualizar visita");
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute("DELETE FROM visits WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en Visit.delete:", error);
      throw new Error("Error al eliminar visita");
    }
  }

  static async getStatsByType() {
    try {
      const [rows] = await pool.execute(
        `SELECT type, COUNT(*) as count, SUM(cost) as totalRevenue, AVG(cost) as avgCost 
         FROM visits 
         GROUP BY type 
         ORDER BY count DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error en Visit.getStatsByType:", error);
      throw new Error("Error al obtener estadísticas por tipo");
    }
  }

  static async count() {
    try {
      const [rows] = await pool.execute("SELECT COUNT(*) as total FROM visits");
      return rows[0].total;
    } catch (error) {
      console.error("Error en Visit.count:", error);
      throw new Error("Error al contar visitas");
    }
  }
}

module.exports = Visit;
