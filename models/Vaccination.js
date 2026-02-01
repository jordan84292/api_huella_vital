/**
 * Modelo de Vacunación con Supabase
 */

const { supabase } = require("../config/database");

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
      const { data, error } = await supabase
        .from("vaccinations")
        .select("*")
        .order("created_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Vaccination.findAll:", error);
      throw new Error("Error al obtener vacunaciones");
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("vaccinations")
        .select("*")
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error en Vaccination.findById:", error);
      throw new Error("Error al buscar vacunación por ID");
    }
  }

  static async findByPatientId(patientId) {
    try {
      const { data, error } = await supabase
        .from("vaccinations")
        .select("*")
        .eq("patientid", patientId)
        .order("created_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Vaccination.findByPatientId:", error);
      throw new Error("Error al buscar vacunaciones por paciente");
    }
  }

  static async getUpcoming(days = 30) {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const { data, error } = await supabase
        .from("vaccinations")
        .select(
          `
          *,
          patients!inner(name, species, ownerId),
          clients!inner(name, phone)
        `,
        )
        .gte("nextDue", today.toISOString().split("T")[0])
        .lte("nextDue", futureDate.toISOString().split("T")[0])
        .order("nextDue", { ascending: true });

      if (error) throw error;

      return (data || []).map((vaccination) => ({
        ...vaccination,
        patientName: vaccination.patients.name,
        species: vaccination.patients.species,
        ownerName: vaccination.clients.name,
        ownerPhone: vaccination.clients.phone,
      }));
    } catch (error) {
      console.error("Error en Vaccination.getUpcoming:", error);
      throw new Error("Error al obtener vacunaciones próximas");
    }
  }

  static async create(vaccinationData) {
    try {
      const { patientId, vaccine, veterinarian, notes } = vaccinationData;

      // Usar función RPC de Supabase solo con los campos actuales
      const { data, error } = await supabase.rpc("create_vaccination", {
        p_patientid: patientId,
        p_vaccine: vaccine,
        p_veterinarian: veterinarian || null,
        p_notes: notes || null,
      });

      if (error) throw error;

      const newVaccination = Array.isArray(data) ? data[0] : data;

      return newVaccination?.id
        ? await this.findById(newVaccination.id)
        : newVaccination;
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

      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("update_vaccination", {
        p_id: id,
        p_vaccine: vaccine || null,
        p_date: date || null,
        p_nextdue: nextDue || null,
        p_batchnumber: batchNumber || null,
        p_veterinarian: veterinarian || null,
        p_notes: notes || null,
      });

      if (error) throw error;
      if (!data || (Array.isArray(data) && data.length === 0)) return null;

      return await this.findById(id);
    } catch (error) {
      console.error("Error en Vaccination.update:", error);
      throw new Error("Error al actualizar vacunación");
    }
  }

  static async delete(id) {
    try {
      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("delete_vaccination", {
        p_id: id,
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error("Error en Vaccination.delete:", error);
      throw new Error("Error al eliminar vacunación");
    }
  }

  static async count() {
    try {
      const { count, error } = await supabase
        .from("vaccinations")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error en Vaccination.count:", error);
      throw new Error("Error al contar vacunaciones");
    }
  }
}

module.exports = Vaccination;
