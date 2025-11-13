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
        .order("date", { ascending: false });

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
        .eq("patientId", patientId)
        .order("date", { ascending: false });

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
        `
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

  static async getOverdue() {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("vaccinations")
        .select(
          `
          *,
          patients!inner(name, species, ownerId),
          clients!inner(name, phone)
        `
        )
        .lt("nextDue", today)
        .order("nextDue", { ascending: true });

      if (error) throw error;

      return (data || []).map((vaccination) => {
        const nextDue = new Date(vaccination.nextDue);
        const now = new Date();
        const daysOverdue = Math.floor((now - nextDue) / (1000 * 60 * 60 * 24));

        return {
          ...vaccination,
          patientName: vaccination.patients.name,
          species: vaccination.patients.species,
          ownerName: vaccination.clients.name,
          ownerPhone: vaccination.clients.phone,
          daysOverdue,
        };
      });
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

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("vaccinations")
        .insert([
          {
            patientId,
            date,
            vaccine,
            nextDue,
            veterinarian,
            batchNumber,
            notes: notes || null,
            created_date: now,
            updated_date: now,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lastVisit del paciente si es más reciente
      const { data: patient } = await supabase
        .from("patients")
        .select("lastVisit")
        .eq("id", patientId)
        .single();

      if (!patient?.lastVisit || new Date(date) > new Date(patient.lastVisit)) {
        await supabase
          .from("patients")
          .update({
            lastVisit: date,
            updated_date: now,
          })
          .eq("id", patientId);
      }

      return await this.findById(data.id);
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

      const { data, error } = await supabase
        .from("vaccinations")
        .update({
          patientId,
          date,
          vaccine,
          nextDue,
          veterinarian,
          batchNumber,
          notes,
          updated_date: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      return await this.findById(id);
    } catch (error) {
      console.error("Error en Vaccination.update:", error);
      throw new Error("Error al actualizar vacunación");
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from("vaccinations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
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
