/**
 * Modelo de Visita con Supabase
 */

const { supabase } = require("../config/database");

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
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Visit.findAll:", error);
      throw new Error("Error al obtener visitas");
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error en Visit.findById:", error);
      throw new Error("Error al buscar visita por ID");
    }
  }

  static async findByPatientId(patientId) {
    try {
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .eq("patientId", patientId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
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

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("visits")
        .insert([
          {
            patientId,
            date,
            type,
            veterinarian,
            diagnosis,
            treatment,
            notes: notes || null,
            cost,
            created_date: now,
            updated_date: now,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lastVisit del paciente
      await supabase
        .from("patients")
        .update({
          lastVisit: date,
          updated_date: now,
        })
        .eq("id", patientId);

      return await this.findById(data.id);
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

      const { data, error } = await supabase
        .from("visits")
        .update({
          patientId,
          date,
          type,
          veterinarian,
          diagnosis,
          treatment,
          notes,
          cost,
          updated_date: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      return await this.findById(id);
    } catch (error) {
      console.error("Error en Visit.update:", error);
      throw new Error("Error al actualizar visita");
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase.from("visits").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error en Visit.delete:", error);
      throw new Error("Error al eliminar visita");
    }
  }

  static async getStatsByType() {
    try {
      const { data, error } = await supabase
        .from("visits")
        .select("type, cost")
        .order("type");

      if (error) throw error;

      const stats = {};
      (data || []).forEach((row) => {
        if (!stats[row.type]) {
          stats[row.type] = {
            count: 0,
            totalRevenue: 0,
            costs: [],
          };
        }
        stats[row.type].count++;
        stats[row.type].totalRevenue += parseFloat(row.cost || 0);
        stats[row.type].costs.push(parseFloat(row.cost || 0));
      });

      return Object.entries(stats)
        .map(([type, data]) => ({
          type,
          count: data.count,
          totalRevenue: data.totalRevenue,
          avgCost: data.totalRevenue / data.count,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error en Visit.getStatsByType:", error);
      throw new Error("Error al obtener estadísticas por tipo");
    }
  }

  static async count() {
    try {
      const { count, error } = await supabase
        .from("visits")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error en Visit.count:", error);
      throw new Error("Error al contar visitas");
    }
  }
}

module.exports = Visit;
