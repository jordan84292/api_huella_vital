const { pool } = require("../config/database");

class Appointment {
  constructor(appointmentData) {
    this.id = appointmentData.id;
    this.patientId = appointmentData.patientId;
    this.date = appointmentData.date;
    this.time = appointmentData.time;
    this.type = appointmentData.type;
    this.veterinarian = appointmentData.veterinarian;
    this.status = appointmentData.status;
    this.notes = appointmentData.notes;
    this.created_date = appointmentData.created_date;
    this.updated_date = appointmentData.updated_date;
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT a.*, 
                p.name as patientName, 
                p.species, 
                c.name as ownerName
         FROM appointments a
         LEFT JOIN patients p ON a.patientId = p.id
         LEFT JOIN clientes c ON p.ownerId = c.id
         ORDER BY a.date DESC, a.time DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error en Appointment.findAll:", error);
      throw new Error("Error al obtener citas");
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT a.*, 
                p.name as patientName, 
                p.species, 
                c.name as ownerName
         FROM appointments a
         LEFT JOIN patients p ON a.patientId = p.id
         LEFT JOIN clientes c ON p.ownerId = c.id
         WHERE a.id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Appointment.findById:", error);
      throw new Error("Error al buscar cita por ID");
    }
  }

  static async findByPatientId(patientId) {
    try {
      const [rows] = await pool.execute(
        `SELECT a.*, 
                p.name as patientName, 
                p.species, 
                c.name as ownerName
         FROM appointments a
         LEFT JOIN patients p ON a.patientId = p.id
         LEFT JOIN clientes c ON p.ownerId = c.id
         WHERE a.patientId = ? 
         ORDER BY a.date DESC, a.time DESC`,
        [patientId]
      );
      return rows;
    } catch (error) {
      console.error("Error en Appointment.findByPatientId:", error);
      throw new Error("Error al buscar citas por paciente");
    }
  }

  static async findByDate(date) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM vistacitapacientecliente
WHERE CAST(date AS DATE) = ? `,
        [date]
      );
      return rows;
    } catch (error) {
      console.error("Error en Appointment.findByDate:", error);
      throw new Error("Error al buscar citas por fecha");
    }
  }

  static async findByStatus(status) {
    try {
      const [rows] = await pool.execute(
        `SELECT a.*, 
                p.name as patientName, 
                p.species, 
                c.name as ownerName
         FROM appointments a
         LEFT JOIN patients p ON a.patientId = p.id
         LEFT JOIN clientes c ON p.ownerId = c.id
         WHERE a.status = ? 
         ORDER BY a.date DESC, a.time DESC`,
        [status]
      );
      return rows;
    } catch (error) {
      console.error("Error en Appointment.findByStatus:", error);
      throw new Error("Error al buscar citas por estado");
    }
  }

  static async create(appointmentData) {
    try {
      const { patientId, date, time, type, veterinarian, status, notes } =
        appointmentData;

      const [result] = await pool.execute(
        `INSERT INTO appointments 
         (patientId, date, time, type, veterinarian, status, notes, created_date, updated_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          patientId,
          date,
          time,
          type,
          veterinarian,
          status || "Programada",
          notes || null,
        ]
      );

      if (status == "Completada") {
        await pool.execute("Update patients set lastVisit = ? where id = ?", [
          date,
          patientId,
        ]);
      }
      return await this.findById(result.insertId);
    } catch (error) {
      console.error("Error en Appointment.create:", error);
      throw new Error("Error al crear cita");
    }
  }

  static async update(id, appointmentData) {
    try {
      const { patientId, date, time, type, veterinarian, status, notes } =
        appointmentData;

      const [result] = await pool.execute(
        `UPDATE appointments 
         SET patientId = ?, date = ?, time = ?, type = ?, 
             veterinarian = ?, status = ?, notes = ?, updated_date = NOW()
         WHERE id = ?`,
        [patientId, date, time, type, veterinarian, status, notes, id]
      );

      if (result.affectedRows === 0) {
        return null;
      }
      if (status == "Completada") {
        await pool.execute("Update patients set lastVisit = ? where id = ?", [
          date,
          patientId,
        ]);
      }
      return await this.findById(id);
    } catch (error) {
      console.error("Error en Appointment.update:", error);
      throw new Error("Error al actualizar cita");
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM appointments WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en Appointment.delete:", error);
      throw new Error("Error al eliminar cita");
    }
  }

  static async getStatsByType() {
    try {
      const [rows] = await pool.execute(
        `SELECT type, COUNT(*) as count 
         FROM appointments 
         GROUP BY type 
         ORDER BY count DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error en Appointment.getStatsByType:", error);
      throw new Error("Error al obtener estadísticas por tipo");
    }
  }

  static async getStatsByStatus() {
    try {
      const [rows] = await pool.execute(
        `SELECT status, COUNT(*) as count 
         FROM appointments 
         GROUP BY status`
      );
      return rows;
    } catch (error) {
      console.error("Error en Appointment.getStatsByStatus:", error);
      throw new Error("Error al obtener estadísticas por estado");
    }
  }

  static async count() {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) as total FROM appointments"
      );
      return rows[0].total;
    } catch (error) {
      console.error("Error en Appointment.count:", error);
      throw new Error("Error al contar citas");
    }
  }

  static async countByDate(date) {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) as total FROM appointments WHERE date = ?",
        [date]
      );
      return rows[0].total;
    } catch (error) {
      console.error("Error en Appointment.countByDate:", error);
      throw new Error("Error al contar citas por fecha");
    }
  }
}

module.exports = Appointment;
