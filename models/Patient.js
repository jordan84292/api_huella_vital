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
    this.birthdate = patientData.birthdate;
    this.cedula = patientData.cedula;
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
          `id, name, species, breed, age, weight, gender, birthdate, cedula, color, allergies, status, created_date, updated_date`,
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
          `id, name, species, breed, age, weight, gender, birthdate, cedula, color, allergies, status, created_date, updated_date`,
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

  static async findByCedula(cedula) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `id, name, species, breed, age, weight, gender, birthdate, cedula, color, allergies, status, created_date, updated_date`,
        )
        .eq("cedula", cedula)
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Patient.findByCedula:", error);
      throw new Error("Error al buscar pacientes por cédula");
    }
  }

  static async findByOwnerId(ownerId) {
    try {
      // Buscar pacientes donde el ownerId coincida con el user ID
      // Como en este sistema los pacientes pueden estar asociados por cedula o user ID
      // Vamos a buscar por cedula usando el ID del usuario como cedula
      const { data, error } = await supabase
        .from("patients")
        .select(
          `id, name, species, breed, age, weight, gender, birthdate, cedula, color, allergies, status, created_date, updated_date`,
        )
        .eq("cedula", ownerId)
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Patient.findByOwnerId:", error);
      throw new Error("Error al buscar pacientes por owner ID");
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
        birthDate, // Puede venir como birthDate desde el frontend
        birthdate, // O como birthdate
        cedula,
        color,
        allergies,
        status,
      } = patientData;

      // Usar birthdate si existe, si no usar birthDate
      const birthdateValue = birthdate || birthDate || null;

      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("create_patient", {
        p_name: name,
        p_species: species,
        p_breed: breed,
        p_gender: gender,
        p_birthdate: birthdateValue,
        p_age: age || null,
        p_weight: weight || null,
        p_cedula: cedula,
        p_color: color || null,
        p_allergies: allergies || null,
        p_status: status || "Activo",
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
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
        birthDate, // Puede venir como birthDate desde el backend
        birthdate, // O como birthdate
        cedula,
        color,
        allergies,
        status,
      } = patientData;

      // Usar birthdate si existe, si no usar birthDate
      const birthdateValue = birthdate || birthDate || null;

      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("update_patient", {
        p_id: id,
        p_age: age || null,
        p_allergies: allergies || null,
        p_birthdate: birthdateValue,
        p_breed: breed || null,
        p_cedula: cedula || null,
        p_color: color || null,
        p_gender: gender || null,
        p_name: name || null,
        p_species: species || null,
        p_status: status || null,
        p_weight: weight || null,
      });

      if (error) {
        throw error;
      }

      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error("Error en Patient.update:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("delete_patient", {
        p_id: id,
      });

      if (error) throw error;
      return data === true;
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
          id, name, species, breed, age, weight, gender, birthdate,
          cedula, color, allergies, status,
          created_date, updated_date
        `,
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
          id, name, species, breed, age, weight, gender, birthdate,
          cedula, color, allergies, status,
          created_date, updated_date
        `,
          { count: "exact" },
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
