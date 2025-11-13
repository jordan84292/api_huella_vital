/**
 * Middleware de Validación
 * @description Contiene todas las validaciones para las rutas de usuarios y clientes
 */

const { body, param, query } = require("express-validator");

// ============================================
// VALIDACIONES DE USUARIOS
// ============================================

/**
 * Validaciones para los datos de usuario
 * Incluye validaciones para nombre, email y teléfono
 */
const validateUser = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),

  body("telefono")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es requerido")
    .matches(/^[\+]?[0-9\-\(\)\s]{7,20}$/)
    .withMessage("Formato de teléfono inválido")
    .isLength({ min: 7, max: 20 })
    .withMessage("El teléfono debe tener entre 7 y 20 caracteres"),
];

/**
 * Validaciones para registro de usuario
 * Incluye validación de contraseña
 */
const validateRegister = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),

  body("telefono")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es requerido")
    .matches(/^[\+]?[0-9\-\(\)\s]{7,20}$/)
    .withMessage("Formato de teléfono inválido")
    .isLength({ min: 7, max: 20 })
    .withMessage("El teléfono debe tener entre 7 y 20 caracteres"),

  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("La contraseña debe tener entre 8 y 128 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial"
    ),
];

/**
 * Validaciones para login
 */
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

/**
 * Validaciones para actualización de perfil
 */
const validateProfileUpdate = [
  body("nombre")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),

  body("telefono")
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\-\(\)\s]{7,20}$/)
    .withMessage("Formato de teléfono inválido")
    .isLength({ min: 7, max: 20 })
    .withMessage("El teléfono debe tener entre 7 y 20 caracteres"),

  body("currentPassword")
    .optional()
    .notEmpty()
    .withMessage("La contraseña actual no puede estar vacía"),

  body("newPassword")
    .optional()
    .isLength({ min: 8, max: 128 })
    .withMessage("La nueva contraseña debe tener entre 8 y 128 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "La nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial"
    ),
];

/**
 * Validación para el parámetro ID de usuario
 * Verifica que sea un número entero positivo
 */
const validateUserId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

/**
 * Validación para parámetros de paginación
 * Verifica que page y limit sean números válidos
 */
const validatePagination = [
  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero positivo"),

  body("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100"),
];

/**
 * Validación para búsquedas
 * Verifica que el término de búsqueda tenga una longitud mínima
 */
const validateSearch = [
  body("q")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El término de búsqueda debe tener entre 1 y 100 caracteres"),
];

/**
 * Validaciones específicas para actualización parcial (PATCH)
 * Permite campos opcionales para actualizaciones parciales
 */
const validateUserPartial = [
  body("nombre")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),

  body("telefono")
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\-\(\)\s]{7,20}$/)
    .withMessage("Formato de teléfono inválido")
    .isLength({ min: 7, max: 20 })
    .withMessage("El teléfono debe tener entre 7 y 20 caracteres"),
];

// ============================================
// VALIDACIONES DE CLIENTES
// ============================================

/**
 * Validaciones para los datos completos de cliente
 * Incluye validaciones para name, email, phone, address, city y status
 */
const validateClient = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 150 })
    .withMessage("El nombre debe tener entre 2 y 150 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es requerido")
    .matches(/^[\+]?[0-9\-\(\)\s]{7,20}$/)
    .withMessage("Formato de teléfono inválido")
    .isLength({ min: 7, max: 20 })
    .withMessage("El teléfono debe tener entre 7 y 20 caracteres"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("La dirección es requerida")
    .isLength({ min: 5, max: 255 })
    .withMessage("La dirección debe tener entre 5 y 255 caracteres"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("La ciudad es requerida")
    .isLength({ min: 2, max: 100 })
    .withMessage("La ciudad debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("La ciudad solo puede contener letras y espacios"),

  body("status")
    .optional()
    .trim()
    .isIn(["Activo", "Inactivo"])
    .withMessage("El estado debe ser 'Activo' o 'Inactivo'"),
];

/**
 * Validaciones para actualización parcial de cliente (PATCH)
 * Permite campos opcionales para actualizaciones parciales
 */
const validateClientPartial = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("El nombre debe tener entre 2 y 150 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\-\(\)\s]{7,20}$/)
    .withMessage("Formato de teléfono inválido")
    .isLength({ min: 7, max: 20 })
    .withMessage("El teléfono debe tener entre 7 y 20 caracteres"),

  body("address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("La dirección debe tener entre 5 y 255 caracteres"),

  body("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("La ciudad debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("La ciudad solo puede contener letras y espacios"),

  body("status")
    .optional()
    .trim()
    .isIn(["Activo", "Inactivo"])
    .withMessage("El estado debe ser 'Activo' o 'Inactivo'"),
];

/**
 * Validación para el parámetro ID de cliente
 * Verifica que sea un número entero positivo
 */
const validateClientId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

/**
 * Validación para parámetros de paginación en query
 * Verifica que page y limit sean números válidos
 */
const validateClientPagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero positivo"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El término de búsqueda debe tener entre 1 y 100 caracteres"),
];

/**
 * Validación para búsquedas de clientes
 * Verifica que el término de búsqueda tenga una longitud válida
 */
const validateClientSearch = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("El término de búsqueda es requerido")
    .isLength({ min: 1, max: 100 })
    .withMessage("El término de búsqueda debe tener entre 1 y 100 caracteres"),
];

/**
 * Middleware para sanitizar y limpiar datos de entrada de clientes
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const sanitizeClientInput = (req, res, next) => {
  if (req.body) {
    // Eliminar espacios en blanco al inicio y final de strings
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    });

    // Eliminar campos vacíos
    Object.keys(req.body).forEach((key) => {
      if (
        req.body[key] === "" ||
        req.body[key] === null ||
        req.body[key] === undefined
      ) {
        delete req.body[key];
      }
    });

    // Establecer valor por defecto para status si no se proporciona
    if (req.method === "POST" && !req.body.status) {
      req.body.status = "Activo";
    }
  }
  next();
};

// ============================================
// MIDDLEWARES GENERALES
// ============================================

/**
 * Middleware para sanitizar y limpiar datos de entrada
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Eliminar espacios en blanco al inicio y final de strings
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    });

    // Eliminar campos vacíos
    Object.keys(req.body).forEach((key) => {
      if (
        req.body[key] === "" ||
        req.body[key] === null ||
        req.body[key] === undefined
      ) {
        delete req.body[key];
      }
    });
  }
  next();
};

/**
 * Middleware para validar JSON malformado
 * @param {Error} err - Error object
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const validateJSON = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "JSON malformado",
      error: "La estructura del JSON enviado no es válida",
    });
  }
  next(err);
};

/**
 * Middleware para manejar errores de validación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

/**
 * Middleware para validar Content-Type en POST y PUT
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const validateContentType = (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (!req.is("application/json")) {
      return res.status(400).json({
        success: false,
        message: "Content-Type debe ser application/json",
      });
    }
  }
  next();
};

// ============================================
// VALIDACIONES DE PACIENTES
// ============================================

/**
 * Validaciones para los datos completos de paciente
 */
const validatePatient = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("species")
    .trim()
    .notEmpty()
    .withMessage("La especie es requerida")
    .isLength({ min: 2, max: 50 })
    .withMessage("La especie debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("La especie solo puede contener letras y espacios"),

  body("breed")
    .trim()
    .notEmpty()
    .withMessage("La raza es requerida")
    .isLength({ min: 2, max: 100 })
    .withMessage("La raza debe tener entre 2 y 100 caracteres"),

  body("age")
    .notEmpty()
    .withMessage("La edad es requerida")
    .isFloat({ min: 0, max: 50 })
    .withMessage("La edad debe ser un número entre 0 y 50"),

  body("weight")
    .notEmpty()
    .withMessage("El peso es requerido")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("El peso debe ser un número entre 0 y 1000"),

  body("gender")
    .trim()
    .notEmpty()
    .withMessage("El género es requerido")
    .isIn(["Macho", "Hembra", "Desconocido"])
    .withMessage("El género debe ser 'Macho', 'Hembra' o 'Desconocido'"),

  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("La fecha de nacimiento debe ser una fecha válida")
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }
      return true;
    }),

  body("ownerId")
    .notEmpty()
    .withMessage("El ID del dueño es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del dueño debe ser un número entero positivo"),

  body("lastVisit")
    .optional()
    .isISO8601()
    .withMessage("La última visita debe ser una fecha válida"),

  body("nextVisit")
    .optional()
    .isISO8601()
    .withMessage("La próxima visita debe ser una fecha válida")
    .custom((value, { req }) => {
      if (
        value &&
        req.body.lastVisit &&
        new Date(value) < new Date(req.body.lastVisit)
      ) {
        throw new Error(
          "La próxima visita no puede ser anterior a la última visita"
        );
      }
      return true;
    }),

  body("microchip")
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("El microchip debe tener entre 10 y 20 caracteres")
    .matches(/^[A-Z0-9]+$/)
    .withMessage(
      "El microchip solo puede contener letras mayúsculas y números"
    ),

  body("color")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El color debe tener entre 2 y 50 caracteres"),

  body("allergies")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Las alergias no pueden exceder 500 caracteres"),

  body("status")
    .optional()
    .trim()
    .isIn(["Activo", "Inactivo"])
    .withMessage("El estado debe ser 'Activo' o 'Inactivo'"),
];

/**
 * Validaciones para actualización parcial de paciente (PATCH)
 */
const validatePatientPartial = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("species")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("La especie debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage("La especie solo puede contener letras y espacios"),

  body("breed")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("La raza debe tener entre 2 y 100 caracteres"),

  body("age")
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage("La edad debe ser un número entre 0 y 50"),

  body("weight")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("El peso debe ser un número entre 0 y 1000"),

  body("gender")
    .optional()
    .trim()
    .isIn(["Macho", "Hembra", "Desconocido"])
    .withMessage("El género debe ser 'Macho', 'Hembra' o 'Desconocido'"),

  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("La fecha de nacimiento debe ser una fecha válida")
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }
      return true;
    }),

  body("ownerId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del dueño debe ser un número entero positivo"),

  body("lastVisit")
    .optional()
    .isISO8601()
    .withMessage("La última visita debe ser una fecha válida"),

  body("nextVisit")
    .optional()
    .isISO8601()
    .withMessage("La próxima visita debe ser una fecha válida")
    .custom((value, { req }) => {
      if (
        value &&
        req.body.lastVisit &&
        new Date(value) < new Date(req.body.lastVisit)
      ) {
        throw new Error(
          "La próxima visita no puede ser anterior a la última visita"
        );
      }
      return true;
    }),

  body("microchip")
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("El microchip debe tener entre 10 y 20 caracteres")
    .matches(/^[A-Z0-9]+$/)
    .withMessage(
      "El microchip solo puede contener letras mayúsculas y números"
    ),

  body("color")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El color debe tener entre 2 y 50 caracteres"),

  body("allergies")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Las alergias no pueden exceder 500 caracteres"),

  body("status")
    .optional()
    .trim()
    .isIn(["Activo", "Inactivo"])
    .withMessage("El estado debe ser 'Activo' o 'Inactivo'"),
];

/**
 * Validación para el parámetro ID de paciente
 */
const validatePatientId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

/**
 * Validación para parámetros de paginación de pacientes en query
 */
const validatePatientPagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero positivo"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El término de búsqueda debe tener entre 1 y 100 caracteres"),
];

/**
 * Validación para búsquedas de pacientes
 */
const validatePatientSearch = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("El término de búsqueda es requerido")
    .isLength({ min: 1, max: 100 })
    .withMessage("El término de búsqueda debe tener entre 1 y 100 caracteres"),
];

// ============================================
// VALIDACIONES DE VISITAS
// ============================================

/**
 * Validaciones para los datos completos de visita
 */
const validateVisit = [
  body("patientId")
    .notEmpty()
    .withMessage("El ID del paciente es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del paciente debe ser un número entero positivo"),

  body("date")
    .notEmpty()
    .withMessage("La fecha es requerida")
    .isISO8601()
    .withMessage("La fecha debe ser válida"),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("El tipo de visita es requerido")
    .isIn(["Consulta", "Vacunación", "Cirugía", "Control", "Emergencia"])
    .withMessage(
      "El tipo debe ser: Consulta, Vacunación, Cirugía, Control o Emergencia"
    ),

  body("veterinarian")
    .trim()
    .notEmpty()
    .withMessage("El veterinario es requerido")
    .isLength({ min: 2, max: 150 })
    .withMessage("El veterinario debe tener entre 2 y 150 caracteres"),

  body("diagnosis")
    .trim()
    .notEmpty()
    .withMessage("El diagnóstico es requerido")
    .isLength({ min: 5, max: 1000 })
    .withMessage("El diagnóstico debe tener entre 5 y 1000 caracteres"),

  body("treatment")
    .trim()
    .notEmpty()
    .withMessage("El tratamiento es requerido")
    .isLength({ min: 5, max: 1000 })
    .withMessage("El tratamiento debe tener entre 5 y 1000 caracteres"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Las notas no pueden exceder 1000 caracteres"),

  body("cost")
    .notEmpty()
    .withMessage("El costo es requerido")
    .isFloat({ min: 0, max: 99999999999999 })
    .withMessage("El costo debe ser un número entre 0 y 99999999999999"),
];

/**
 * Validación para el parámetro ID de visita
 */
const validateVisitId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

// ============================================
// VALIDACIONES DE VACUNACIONES
// ============================================

/**
 * Validaciones para los datos completos de vacunación
 */
const validateVaccination = [
  body("patientId")
    .notEmpty()
    .withMessage("El ID del paciente es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del paciente debe ser un número entero positivo"),

  body("date")
    .notEmpty()
    .withMessage("La fecha es requerida")
    .isISO8601()
    .withMessage("La fecha debe ser válida")
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error("La fecha de vacunación no puede ser futura");
      }
      return true;
    }),

  body("vaccine")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la vacuna es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre de la vacuna debe tener entre 2 y 100 caracteres"),

  body("nextDue")
    .notEmpty()
    .withMessage("La fecha de próxima vacunación es requerida")
    .isISO8601()
    .withMessage("La fecha de próxima vacunación debe ser válida")
    .custom((value, { req }) => {
      if (
        value &&
        req.body.date &&
        new Date(value) <= new Date(req.body.date)
      ) {
        throw new Error(
          "La fecha de próxima vacunación debe ser posterior a la fecha de aplicación"
        );
      }
      return true;
    }),

  body("veterinarian")
    .trim()
    .notEmpty()
    .withMessage("El veterinario es requerido")
    .isLength({ min: 2, max: 150 })
    .withMessage("El veterinario debe tener entre 2 y 150 caracteres"),

  body("batchNumber")
    .trim()
    .notEmpty()
    .withMessage("El número de lote es requerido")
    .isLength({ min: 3, max: 50 })
    .withMessage("El número de lote debe tener entre 3 y 50 caracteres"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Las notas no pueden exceder 500 caracteres"),
];

/**
 * Validación para el parámetro ID de vacunación
 */
const validateVaccinationId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

// Validación para crear/actualizar citas
const validateAppointment = [
  body("patientId")
    .notEmpty()
    .withMessage("El ID del paciente es requerido")
    .isInt()
    .withMessage("El ID del paciente debe ser un número"),

  body("date")
    .notEmpty()
    .withMessage("La fecha es requerida")
    .isISO8601()
    .withMessage("La fecha debe estar en formato válido (YYYY-MM-DD)"),

  body("time")
    .notEmpty()
    .withMessage("La hora es requerida")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage("La hora debe estar en formato válido (HH:MM)"),

  body("type")
    .notEmpty()
    .withMessage("El tipo de cita es requerido")
    .isIn(["Consulta", "Vacunación", "Cirugía", "Control", "Emergencia"])
    .withMessage("El tipo de cita no es válido"),

  body("veterinarian")
    .notEmpty()
    .withMessage("El veterinario es requerido")
    .isString()
    .withMessage("El veterinario debe ser texto")
    .isLength({ min: 2, max: 255 })
    .withMessage("El veterinario debe tener entre 2 y 255 caracteres"),

  body("status")
    .optional()
    .isIn(["Programada", "Completada", "Cancelada"])
    .withMessage("El estado no es válido"),

  body("notes").optional().isString().withMessage("Las notas deben ser texto"),
];

// Validación para ID de cita
const validateAppointmentId = [
  param("id")
    .notEmpty()
    .withMessage("El ID de la cita es requerido")
    .isInt()
    .withMessage("El ID de la cita debe ser un número"),
];

module.exports = {
  // Validaciones de usuarios
  validateUser,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateUserId,
  validatePagination,
  validateSearch,
  validateUserPartial,
  // Validaciones de clientes
  validateClient,
  validateClientPartial,
  validateClientId,
  validateClientPagination,
  validateClientSearch,
  sanitizeClientInput,
  // Validaciones de pacientes
  validatePatient,
  validatePatientPartial,
  validatePatientId,
  validatePatientPagination,
  validatePatientSearch,
  // Validaciones de visitas
  validateVisit,
  validateVisitId,
  // Validaciones de vacunaciones
  validateVaccination,
  validateVaccinationId,
  // Validaciones de citas
  validateAppointment,
  validateAppointmentId,
  // Middlewares generales

  sanitizeInput,
  validateJSON,
  handleValidationErrors,
  validateContentType,
};
