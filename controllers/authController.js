/**
 * Controlador de Autenticación
 * @description Maneja las operaciones de registro, login y autenticación
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");

/**
 * Clase que maneja las operaciones de autenticación
 */
class AuthController {
  /**
   * Registra un nuevo usuario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async register(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { nombre, email, telefono, password } = req.body;

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "El email ya está registrado",
        });
      }

      // Hashear la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear el usuario
      const newUser = await User.create({
        nombre,
        email,
        telefono,
        password: hashedPassword,
      });

      // Generar JWT token
      const token = jwt.sign(
        {
          userId: newUser.id,
          email: newUser.email,
        },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
      );

      res.status(201).json({
        success: true,
        message: "Usuario registrado correctamente",
        data: {
          user: newUser,
          token,
          expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        },
      });
    } catch (error) {
      console.error("Error en register:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Autentica un usuario (login)
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async login(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Buscar usuario por email (con contraseña)
      const user = await User.findByEmailWithPassword(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Generar JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
      );

      // Remover password del objeto user antes de enviarlo
      delete user.password;

      res.status(200).json({
        success: true,
        message: "Login exitoso",
        data: {
          user,
          token,
          expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Perfil obtenido correctamente",
        data: user,
      });
    } catch (error) {
      console.error("Error en getProfile:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Actualiza el perfil del usuario autenticado
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async updateProfile(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const userId = req.user.userId;
      const {
        nombre,
        email,
        telefono,
        currentPassword,
        newPassword,
        rolName,
        status,
      } = req.body;

      // Verificar si el usuario existe
      const existingUser = await User.findByEmailWithPassword(req.user.email);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      console.log("Usuario existente:", existingUser);
      console.log("Datos recibidos:", {
        nombre,
        email,
        telefono,
        rolName,
        status,
        hasNewPassword: !!newPassword,
      });

      // Crear objeto con solo los campos que realmente cambian
      const updateData = {};

      if (nombre && nombre !== existingUser.nombre) {
        updateData.nombre = nombre;
      }
      if (email && email !== existingUser.email) {
        updateData.email = email;
      }
      if (telefono && telefono !== existingUser.telefono) {
        updateData.telefono = telefono;
      }
      if (rolName && rolName !== existingUser.rolName) {
        updateData.rolName = rolName;
      }
      if (status && status !== existingUser.status) {
        updateData.status = status;
      }

      // Si se quiere cambiar la contraseña
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message:
              "La contraseña actual es requerida para cambiar la contraseña",
          });
        }

        // Verificar contraseña actual
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          existingUser.password,
        );
        if (!isCurrentPasswordValid) {
          return res.status(401).json({
            success: false,
            message: "Contraseña actual incorrecta",
          });
        }

        // Hashear nueva contraseña
        const saltRounds = 12;
        updateData.password = await bcrypt.hash(newPassword, saltRounds);
        console.log("Nueva contraseña hasheada y agregada a updateData");
      }

      console.log("Datos a actualizar:", Object.keys(updateData));

      // Si no hay cambios, retornar error
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No hay cambios para actualizar",
        });
      }

      // Verificar si el email ya existe en otro usuario
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailUser = await User.findByEmail(updateData.email);
        if (emailUser && emailUser.id !== userId) {
          return res.status(409).json({
            success: false,
            message: "El email ya está registrado en otro usuario",
          });
        }
      }

      // Si solo se actualiza la contraseña, incluir los otros campos obligatorios
      if (updateData.password && Object.keys(updateData).length === 1) {
        updateData.nombre = existingUser.nombre;
        updateData.email = existingUser.email;
        updateData.telefono = existingUser.telefono;
        updateData.rolName = existingUser.rolName;
        updateData.status = existingUser.status;
      }

      console.log("UpdateData final:", updateData);

      // Actualizar el usuario
      const updatedUser = await User.update(userId, updateData);

      res.status(200).json({
        success: true,
        message: "Perfil actualizado correctamente",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error en updateProfile:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Renueva el token JWT
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async refreshToken(req, res) {
    try {
      const userId = req.user.userId;
      const email = req.user.email;

      // Generar nuevo token
      const newToken = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
      );

      res.status(200).json({
        success: true,
        message: "Token renovado correctamente",
        data: {
          token: newToken,
          expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        },
      });
    } catch (error) {
      console.error("Error en refreshToken:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Logout (en el cliente simplemente eliminar el token)
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  static async logout(req, res) {
    try {
      // En una implementación más avanzada, aquí podrías:
      // - Agregar el token a una lista negra
      // - Invalidar el token en una base de datos de sesiones
      // - Registrar el logout en logs de auditoría

      res.status(200).json({
        success: true,
        message: "Logout exitoso",
        data: {
          message: "Token invalidado. Elimina el token del cliente.",
        },
      });
    } catch (error) {
      console.error("Error en logout:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;
