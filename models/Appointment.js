/**
 * Modelo de Cita con Supabase
 */

const { supabase } = require("../config/database");

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
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*");

      if (error) throw error;
      return appointments;
    } catch (error) {
      throw new Error("Error al obtener citas");
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          patients!inner(name, species),
          clientes!inner(name)
        `
        )
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        return {
          ...data,
          patientName: data.patients.name,
          species: data.patients.species,
          ownerName: data.clientes.name,
        };
      }
      return null;
    } catch (error) {
      console.error("Error en Appointment.findById:", error);
      throw new Error("Error al buscar cita por ID");
    }
  }

  static async findByPatientId(patientId) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          patients!inner(name, species),
          clientes!inner(name)
        `
        )
        .eq("patientId", patientId)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) throw error;

      return (data || []).map((appointment) => ({
        ...appointment,
        patientName: appointment.patients.name,
        species: appointment.patients.species,
        ownerName: appointment.clientes.name,
      }));
    } catch (error) {
      console.error("Error en Appointment.findByPatientId:", error);
      throw new Error("Error al buscar citas por paciente");
    }
  }

  static async findByDate(date) {
    try {
      const { data, error } = await supabase
        .from("vistacitapacientecliente")
        .select("*")
        .eq("date", date);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Appointment.findByDate:", error);
      throw new Error("Error al buscar citas por fecha");
    }
  }

  static async findByStatus(status) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          patients!inner(name, species),
          clientes!inner(name)
        `
        )
        .eq("status", status)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) throw error;

      return (data || []).map((appointment) => ({
        ...appointment,
        patientName: appointment.patients.name,
        species: appointment.patients.species,
        ownerName: appointment.clientes.name,
      }));
    } catch (error) {
      console.error("Error en Appointment.findByStatus:", error);
      throw new Error("Error al buscar citas por estado");
    }
  }

  static async create(appointmentData) {
    try {
      const { patientId, date, time, type, veterinarian, status, notes } =
        appointmentData;

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("appointments")
        .insert([
          {
            patientId,
            date,
            time,
            type,
            veterinarian,
            status: status || "Programada",
            notes: notes || null,
            created_date: now,
            updated_date: now,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lastVisit si el status es Completada
      if (status === "Completada") {
        await supabase
          .from("patients")
          .update({ lastVisit: date })
          .eq("id", patientId);
      }

      return await this.findById(data.id);
    } catch (error) {
      console.error("Error en Appointment.create:", error);
      throw new Error("Error al crear cita");
    }
  }

  static async update(id, appointmentData) {
    try {
      const { patientId, date, time, type, veterinarian, status, notes } =
        appointmentData;

      const { data, error } = await supabase
        .from("appointments")
        .update({
          patientId,
          date,
          time,
          type,
          veterinarian,
          status,
          notes,
          updated_date: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      // Actualizar lastVisit si el status es Completada
      if (status === "Completada") {
        await supabase
          .from("patients")
          .update({ lastVisit: date })
          .eq("id", patientId);
      }

      return await this.findById(id);
    } catch (error) {
      console.error("Error en Appointment.update:", error);
      throw new Error("Error al actualizar cita");
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error en Appointment.delete:", error);
      throw new Error("Error al eliminar cita");
    }
  }

  static async getStatsByType() {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("type")
        .order("type");

      if (error) throw error;

      const stats = {};
      (data || []).forEach((row) => {
        stats[row.type] = (stats[row.type] || 0) + 1;
      });

      return Object.entries(stats)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error en Appointment.getStatsByType:", error);
      throw new Error("Error al obtener estadísticas por tipo");
    }
  }

  static async getStatsByStatus() {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("status")
        .order("status");

      if (error) throw error;

      const stats = {};
      (data || []).forEach((row) => {
        stats[row.status] = (stats[row.status] || 0) + 1;
      });

      return Object.entries(stats).map(([status, count]) => ({
        status,
        count,
      }));
    } catch (error) {
      console.error("Error en Appointment.getStatsByStatus:", error);
      throw new Error("Error al obtener estadísticas por estado");
    }
  }

  static async count() {
    try {
      const { count, error } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error en Appointment.count:", error);
      throw new Error("Error al contar citas");
    }
  }

  static async countByDate(date) {
    try {
      const { count, error } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("date", date);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error en Appointment.countByDate:", error);
      throw new Error("Error al contar citas por fecha");
    }
  }
}

module.exports = Appointment;
