/**
 * Modelo de Cliente con Supabase
 * @description Maneja todas las operaciones CRUD para la entidad Cliente
 */

const { supabase } = require("../config/database");

class Client {
  constructor(clientData) {
    this.id = clientData.id;
    this.name = clientData.name;
    this.email = clientData.email;
    this.phone = clientData.phone;
    this.address = clientData.address;
    this.city = clientData.city;
    this.registrationDate = clientData.registrationDate;
    this.status = clientData.status;
  }

  /**
   * Obtiene todos los clientes
   */
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select(
          "id, name, email, phone, address, city, registrationDate, status"
        )
        .order("registrationDate", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Client.findAll:", error);
      throw new Error("Error al obtener clientes");
    }
  }

  /**
   * Busca un cliente por ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error en Client.findById:", error);
      throw new Error("Error al buscar cliente por ID");
    }
  }

  /**
   * Busca un cliente por email
   */
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select(
          "id, name, email, phone, address, city, registrationDate, status"
        )
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error en Client.findByEmail:", error);
      throw new Error("Error al buscar cliente por email");
    }
  }

  /**
   * Crea un nuevo cliente
   */
  static async create(clientData) {
    try {
      const { id, name, email, phone, address, city, status } = clientData;

      const { data, error } = await supabase
        .from("clientes")
        .insert([
          {
            id,
            name,
            email,
            phone,
            address,
            city,
            status: status || "Activo",
            registrationDate: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("El email ya está registrado");
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error en Client.create:", error);
      throw error;
    }
  }

  /**
   * Actualiza un cliente existente
   */
  static async update(id, clientData) {
    try {
      const { name, email, phone, address, city, status } = clientData;

      const { data, error } = await supabase
        .from("clientes")
        .update({
          name,
          email,
          phone,
          address,
          city,
          status,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("El email ya está registrado");
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error en Client.update:", error);
      throw error;
    }
  }

  /**
   * Elimina un cliente
   */
  static async delete(id) {
    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error en Client.delete:", error);
      throw new Error("Error al eliminar cliente");
    }
  }

  /**
   * Busca clientes por nombre, email o teléfono
   */
  static async searchByName(searchTerm) {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select(
          "id, name, email, phone, address, city, registrationDate, status"
        )
        .or(
          `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
        )
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Client.searchByName:", error);
      throw new Error("Error al buscar clientes por nombre");
    }
  }

  /**
   * Cuenta el total de clientes
   */
  static async count() {
    try {
      const { count, error } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error en Client.count:", error);
      throw new Error("Error al contar clientes");
    }
  }

  /**
   * Obtiene clientes con paginación
   */
  static async paginate(page = 1, limit = 10) {
    try {
      const pageInt = parseInt(page) || 1;
      let limitInt = parseInt(limit) || 10;

      if (limitInt < 1) limitInt = 10;
      if (limitInt > 100) limitInt = 100;

      const from = (pageInt - 1) * limitInt;
      const to = from + limitInt - 1;

      const {
        data: clients,
        error,
        count,
      } = await supabase
        .from("clientes")
        .select(
          "id, name, email, phone, address, city, registrationDate, status",
          { count: "exact" }
        )
        .order("registrationDate", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limitInt);

      return {
        clients: clients || [],
        pagination: {
          currentPage: pageInt,
          totalPages,
          totalClients: total,
          hasNextPage: pageInt < totalPages,
          hasPrevPage: pageInt > 1,
          limit: limitInt,
        },
      };
    } catch (error) {
      console.error("Error en Client.paginate:", error);
      throw new Error("Error al paginar clientes");
    }
  }
}

module.exports = Client;
