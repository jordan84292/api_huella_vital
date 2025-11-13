/**
 * Configuración de conexión a Supabase
 * @description Este módulo maneja la conexión a Supabase
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

/**
 * Configuración de Supabase
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "❌ SUPABASE_URL y SUPABASE_KEY deben estar definidas en las variables de entorno"
  );
}

/**
 * Cliente de Supabase
 */
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Función para probar la conexión a Supabase
 * @returns {Promise<boolean>} True si la conexión es exitosa
 */
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("count")
      .limit(1);

    if (error) throw error;

    console.log("✅ Conexión a Supabase establecida correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con Supabase:", error.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection,
};
