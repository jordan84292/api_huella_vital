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
        .eq("patientid", patientId)
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
        patientid,
        date,
        type,
        veterinarian,
        diagnosis,
        treatment,
        notes,
        cost,
      } = visitData;

      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("create_visit", {
        p_cost: cost,
        p_date: date,
        p_diagnosis: diagnosis,
        p_notes: notes || null,
        p_patientid: patientid || patientId, // Acepta ambos formatos
        p_treatment: treatment,
        p_type: type,
        p_veterinarian: veterinarian || null,
      });

      if (error) throw error;

      const newVisit = Array.isArray(data) ? data[0] : data;

      return newVisit?.id ? await this.findById(newVisit.id) : newVisit;
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
        reason,
        veterinarian,
        diagnosis,
        treatment,
        notes,
      } = visitData;

      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("update_visit", {
        p_id: id,
        p_date: date || null,
        p_reason: reason || null,
        p_diagnosis: diagnosis || null,
        p_treatment: treatment || null,
        p_veterinarian: veterinarian || null,
        p_notes: notes || null,
      });

      if (error) throw error;
      if (!data || (Array.isArray(data) && data.length === 0)) return null;

      return await this.findById(id);
    } catch (error) {
      console.error("Error en Visit.update:", error);
      throw new Error("Error al actualizar visita");
    }
  }

  static async delete(id) {
    try {
      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("delete_visit", {
        p_id: id,
      });

      if (error) throw error;
      return data === true;
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
