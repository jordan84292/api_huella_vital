/**
 * Modelo de Usuario con Supabase
 * @description Maneja todas las operaciones CRUD para la entidad Usuario
 */

const { supabase } = require("../config/database");

class User {
  constructor(userData) {
    this.id = userData.id;
    this.nombre = userData.nombre;
    this.email = userData.email;
    this.telefono = userData.telefono;
    this.password = userData.password;
    this.fecha_creacion = userData.fecha_creacion;
    this.fecha_actualizacion = userData.fecha_actualizacion;
  }

  /**
   * Obtiene todos los usuarios
   */
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select(
          "id, nombre, email, telefono, fecha_creacion, fecha_actualizacion",
        )
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en User.findAll:", error);
      throw new Error("Error al obtener usuarios");
    }
  }

  /**
   * Busca un usuario por ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select(
          "id, nombre, email, telefono, rol, status, fecha_creacion, fecha_actualizacion",
        )
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error("Error en User.findById:", error);
      throw new Error("Error al buscar usuario por ID");
    }
  }

  /**
   * Busca un usuario por email
   */
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select(
          "id, nombre, email, telefono, fecha_creacion, fecha_actualizacion",
        )
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error en User.findByEmail:", error);
      throw new Error("Error al buscar usuario por email");
    }
  }

  /**
   * Crea un nuevo usuario
   */
  static async create(userData) {
    try {
      let { nombre, email, rolName, status, telefono, password } = userData;

      if (!password) {
        password =
          "$2a$12$EvXWYFrmIDImmqpUckeb6.VwCSIi8JX4guQevhu9lJzfElf6AdRvu";
      }

      // Mapeo de roles
      const roleMap = {
        Administrador: "1",
        Veterinario: "2",
        Recepcionista: "3",
        Asistente: "4",
      };
      const rol = roleMap[rolName] || "4";

      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("create_usuario", {
        p_nombre: nombre,
        p_email: email,
        p_telefono: telefono,
        p_password: password,
        p_rol: rol,
        p_status: status || "Activo",
      });

      if (error) {
        if (error.code === "23505" || error.message?.includes("duplicate")) {
          throw new Error("El email ya está registrado");
        }
        throw error;
      }

      // data es un array con un solo elemento cuando se usa RPC
      const newUserId = Array.isArray(data) ? data[0]?.id : data?.id;
      if (newUserId) {
        const newUser = await this.findById(newUserId);
        if (newUser) {
          delete newUser.password;
        }
        return newUser;
      }

      return data;
    } catch (error) {
      console.error("Error en User.create:", error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   */
  static async update(id, userData) {
    try {
      const { nombre, email, telefono, password, rolName, status } = userData;

      const roleMap = {
        Administrador: "1",
        Veterinario: "2",
        Recepcionista: "3",
        Asistente: "4",
      };
      const rol = rolName ? roleMap[rolName] : null;

      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("update_usuario", {
        p_id: id,
        p_nombre: nombre || null,
        p_email: email || null,
        p_telefono: telefono || null,
        p_password: password || null,
        p_rol: rol,
        p_status: status || null,
      });

      if (error) {
        if (error.code === "23505" || error.message?.includes("duplicate")) {
          throw new Error("El email ya está registrado");
        }
        throw error;
      }

      if (!data || (Array.isArray(data) && data.length === 0)) return null;

      const updatedUser = await this.findById(id);
      if (updatedUser) {
        delete updatedUser.password;
      }
      return updatedUser;
    } catch (error) {
      console.error("Error en User.update:", error);
      throw error;
    }
  }

  /**
   * Busca un usuario por email con password (para autenticación) usando función almacenada
   */
  static async findByEmailWithPassword(email) {
    try {
      const { data, error } = await supabase.rpc("find_usuario_by_email", {
        p_email: email,
      });
      if (error) throw error;
      // La función debe retornar un array, tomamos el primer usuario si existe
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("Error en User.findByEmailWithPassword (RPC):", error);
      throw new Error("Error al buscar usuario por email");
    }
  }

  /**
   * Elimina un usuario
   */
  static async delete(id) {
    try {
      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("delete_usuario", {
        p_id: id,
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error("Error en User.delete:", error);
      throw new Error("Error al eliminar usuario");
    }
  }

  /**
   * Busca usuarios por nombre
   */
  static async searchByName(nombre) {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select(
          "id, nombre, email, telefono, fecha_creacion, fecha_actualizacion",
        )
        .ilike("nombre", `%${nombre}%`)
        .order("nombre");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en User.searchByName:", error);
      throw new Error("Error al buscar usuarios por nombre");
    }
  }

  /**
   * Cuenta el total de usuarios
   */
  static async count() {
    try {
      const { count, error } = await supabase
        .from("usuarios")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error en User.count:", error);
      throw new Error("Error al contar usuarios");
    }
  }

  /**
   * Obtiene usuarios con paginación
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
        data: users,
        error,
        count,
      } = await supabase
        .from("usuarios")
        .select(
          "id, nombre, email, telefono, rol, status, fecha_creacion, fecha_actualizacion",
          { count: "exact" },
        )
        .order("fecha_creacion", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limitInt);

      return {
        users: users || [],
        pagination: {
          currentPage: pageInt,
          totalPages,
          totalUsers: total,
          hasNextPage: pageInt < totalPages,
          hasPrevPage: pageInt > 1,
          limit: limitInt,
        },
      };
    } catch (error) {
      console.error("Error en User.paginate:", error);
      throw new Error("Error al paginar usuarios");
    }
  }
}

module.exports = User;
