/**
 * Modelo de Paciente con Supabase
 */

const { supabase } = require("../config/database");

class Patient {
  constructor(patientData) {
    this.id = patientData.id;
    this.name = patientData.name;
    this.species = patientData.species;
    this.breed = patientData.breed;
    this.age = patientData.age;
    this.weight = patientData.weight;
    this.gender = patientData.gender;
    this.birthDate = patientData.birthDate;
    this.ownerId = patientData.ownerId;
    this.lastVisit = patientData.lastVisit;
    this.nextVisit = patientData.nextVisit;
    this.microchip = patientData.microchip;
    this.color = patientData.color;
    this.allergies = patientData.allergies;
    this.status = patientData.status;
    this.created_date = patientData.created_date;
    this.updated_date = patientData.updated_date;
  }

  static async findAll() {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          id, name, species, breed, age, weight, gender, birthDate,
          ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
          created_date, updated_date
        `
        )
        .order("created_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Patient.findAll:", error);
      throw new Error("Error al obtener pacientes");
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          id, name, species, breed, age, weight, gender, birthDate,
          ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
          created_date, updated_date
        `
        )
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error en Patient.findById:", error);
      throw new Error("Error al buscar paciente por ID");
    }
  }

  static async findByOwnerId(ownerId) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          id, name, species, breed, age, weight, gender, birthDate,
          ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
          created_date, updated_date
        `
        )
        .eq("ownerId", ownerId)
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Patient.findByOwnerId:", error);
      throw new Error("Error al buscar pacientes por dueño");
    }
  }

  static async findByMicrochip(microchip) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          id, name, species, breed, age, weight, gender, birthDate,
          ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
          created_date, updated_date
        `
        )
        .eq("microchip", microchip)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error en Patient.findByMicrochip:", error);
      throw new Error("Error al buscar paciente por microchip");
    }
  }

  static async create(patientData) {
    try {
      const {
        name,
        species,
        breed,
        age,
        weight,
        gender,
        birthDate,
        ownerId,
        nextVisit,
        microchip,
        color,
        allergies,
        status,
      } = patientData;

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("patients")
        .insert([
          {
            name,
            species,
            breed,
            age,
            weight,
            gender,
            birthDate: birthDate || null,
            ownerId,
            lastVisit: now,
            nextVisit: nextVisit || null,
            microchip: microchip || null,
            color: color || null,
            allergies: allergies || null,
            status: status || "Activo",
            created_date: now,
            updated_date: now,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("El microchip ya está registrado");
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error en Patient.create:", error);
      throw error;
    }
  }

  static async update(id, patientData) {
    try {
      const {
        name,
        species,
        breed,
        age,
        weight,
        gender,
        birthDate,
        ownerId,
        lastVisit,
        nextVisit,
        microchip,
        color,
        allergies,
        status,
      } = patientData;

      const { data, error } = await supabase
        .from("patients")
        .update({
          name,
          species,
          breed,
          age,
          weight,
          gender,
          birthDate: birthDate || null,
          ownerId,
          lastVisit: lastVisit || null,
          nextVisit: nextVisit || null,
          microchip: microchip || null,
          color: color || null,
          allergies: allergies || null,
          status,
          updated_date: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("El microchip ya está registrado");
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error en Patient.update:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase.from("patients").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error en Patient.delete:", error);
      throw new Error("Error al eliminar paciente");
    }
  }

  static async searchByName(name) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          id, name, species, breed, age, weight, gender, birthDate,
          ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
          created_date, updated_date
        `
        )
        .ilike("name", `%${name}%`)
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Patient.searchByName:", error);
      throw new Error("Error al buscar pacientes por nombre");
    }
  }

  static async count() {
    try {
      const { count, error } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error en Patient.count:", error);
      throw new Error("Error al contar pacientes");
    }
  }

  static async paginate(page = 1, limit = 10) {
    try {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;
      const from = (pageInt - 1) * limitInt;
      const to = from + limitInt - 1;

      const {
        data: patients,
        error,
        count,
      } = await supabase
        .from("patients")
        .select(
          `
          id, name, species, breed, age, weight, gender, birthDate,
          ownerId, lastVisit, nextVisit, microchip, color, allergies, status,
          created_date, updated_date
        `,
          { count: "exact" }
        )
        .order("created_date", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limitInt);

      return {
        patients: patients || [],
        pagination: {
          currentPage: pageInt,
          totalPages,
          totalPatients: total,
          hasNextPage: pageInt < totalPages,
          hasPrevPage: pageInt > 1,
          limit: limitInt,
        },
      };
    } catch (error) {
      console.error("Error en Patient.paginate:", error);
      throw new Error("Error al paginar pacientes");
    }
  }

  static async getStatsBySpecies() {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("species")
        .order("species");

      if (error) throw error;

      // Agrupar manualmente ya que Supabase no tiene GROUP BY directo
      const stats = {};
      data.forEach((row) => {
        stats[row.species] = (stats[row.species] || 0) + 1;
      });

      return Object.entries(stats)
        .map(([species, count]) => ({ species, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error en Patient.getStatsBySpecies:", error);
      throw new Error("Error al obtener estadísticas por especie");
    }
  }

  static async getStatsByStatus() {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("status")
        .order("status");

      if (error) throw error;

      const stats = {};
      data.forEach((row) => {
        stats[row.status] = (stats[row.status] || 0) + 1;
      });

      return Object.entries(stats)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error en Patient.getStatsByStatus:", error);
      throw new Error("Error al obtener estadísticas por status");
    }
  }
}

module.exports = Patient;
