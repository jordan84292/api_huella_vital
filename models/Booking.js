// models/Booking.js
const { supabase } = require("../config/database");

class Booking {
  /**
   * Obtiene todos los slots (disponibles y no disponibles)
   */
  static async getAllSlots(veterinarianName, date) {
    try {
      const { data, error } = await supabase.rpc("get_available_slots", {
        p_veterinarian_name: veterinarianName,
        p_date: date,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Booking.getAllSlots:", error);
      throw new Error("Error al obtener slots");
    }
  }

  /**
   * Obtiene solo los slots disponibles
   */
  static async getAvailableSlots(veterinarianName, date) {
    try {
      const { data, error } = await supabase.rpc("get_only_available_slots", {
        p_veterinarian_name: veterinarianName,
        p_date: date,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Booking.getAvailableSlots:", error);
      throw new Error("Error al obtener slots disponibles");
    }
  }

  /**
   * Verifica si un slot específico está disponible
   */
  static async isSlotAvailable(veterinarianName, date, time) {
    try {
      const slots = await this.getAllSlots(veterinarianName, date);
      const slot = slots.find((s) => s.slot_time === time);

      return slot ? slot.is_available : false;
    } catch (error) {
      console.error("Error en Booking.isSlotAvailable:", error);
      throw new Error("Error al verificar disponibilidad del slot");
    }
  }

  /**
   * Obtiene estadísticas de disponibilidad para un día
   */
  static async getDayStats(veterinarianName, date) {
    try {
      const slots = await this.getAllSlots(veterinarianName, date);

      const total = slots.length;
      const available = slots.filter((s) => s.is_available).length;
      const booked = slots.filter((s) => !s.is_available).length;

      return {
        date,
        veterinarian: veterinarianName,
        totalSlots: total,
        availableSlots: available,
        bookedSlots: booked,
        occupancyRate: total > 0 ? ((booked / total) * 100).toFixed(2) : 0,
        slots: slots,
      };
    } catch (error) {
      console.error("Error en Booking.getDayStats:", error);
      throw new Error("Error al obtener estadísticas del día");
    }
  }

  /**
   * Obtiene disponibilidad para varios días (útil para calendarios)
   */
  static async getMultipleDaysAvailability(
    veterinarianName,
    startDate,
    endDate,
  ) {
    try {
      const days = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Generar array de fechas
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const dayStats = await this.getDayStats(veterinarianName, dateStr);
        days.push(dayStats);
      }

      return days;
    } catch (error) {
      console.error("Error en Booking.getMultipleDaysAvailability:", error);
      throw new Error("Error al obtener disponibilidad de múltiples días");
    }
  }

  /**
   * Obtiene los horarios de negocio configurados
   */
  static async getBusinessHours() {
    try {
      const { data, error } = await supabase
        .from("business_hours")
        .select("*")
        .eq("is_active", true)
        .order("day_of_week");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Booking.getBusinessHours:", error);
      throw new Error("Error al obtener horarios de negocio");
    }
  }

  /**
   * Obtiene los bloques de tiempo (desayunos, almuerzos)
   */
  static async getTimeBlocks() {
    try {
      const { data, error } = await supabase
        .from("time_blocks")
        .select("*")
        .eq("is_active", true)
        .order("start_time");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Booking.getTimeBlocks:", error);
      throw new Error("Error al obtener bloques de tiempo");
    }
  }
}

module.exports = Booking;
