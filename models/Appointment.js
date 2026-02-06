/**
 * Modelo de Cita con Supabase
 */

const { supabase } = require("../config/database");

class Appointment {
  constructor(appointmentData) {
    this.id = appointmentData.id;
    this.patientId = appointmentData.patientId;
    this.date = appointmentData.date;
    this.time = appointmentData.time;
    this.type = appointmentData.type;
    this.veterinarian = appointmentData.veterinarian;
    this.status = appointmentData.status;
    this.notes = appointmentData.notes;
    this.created_date = appointmentData.created_date;
    this.updated_date = appointmentData.updated_date;
  }

  static async findAll() {
    try {
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) throw error;

      if (!appointments || appointments.length === 0) {
        return [];
      }

      console.log(`Processing ${appointments.length} appointments`);

      // Para cada cita, obtener datos del paciente y propietario
      const appointmentsWithDetails = await Promise.all(
        appointments.map(async (appointment) => {
          let patientName = "";
          let species = "";
          let ownerName = "";

          console.log(
            `Processing appointment ${appointment.id}, patientId: ${appointment.patientid}`,
          );

          // Obtener datos del paciente
          if (appointment.patientid) {
            try {
              const { data: patientData, error: patientError } = await supabase
                .from("patients")
                .select("name, species, cedula")
                .eq("id", appointment.patientid)
                .single();

              if (patientError) {
                console.error(
                  `Patient not found for ID ${appointment.patientid}:`,
                  patientError,
                );
              }

              if (!patientError && patientData) {
                patientName = patientData.name;
                species = patientData.species;
                console.log(
                  `Found patient: ${patientName}, cedula: ${patientData.cedula}`,
                );

                // Obtener datos del propietario usando cedula
                if (patientData.cedula) {
                  const { data: clientData, error: clientError } =
                    await supabase
                      .from("clientes")
                      .select("name")
                      .eq("cedula", patientData.cedula)
                      .single();

                  if (clientError) {
                    console.error(
                      `Client not found for cedula ${patientData.cedula}:`,
                      clientError,
                    );
                  }

                  if (!clientError && clientData) {
                    ownerName = clientData.name;
                    console.log(`Found owner: ${ownerName}`);
                  }
                }
              }
            } catch (error) {
              console.error(
                `Error loading data for appointment ${appointment.id}:`,
                error,
              );
            }
          } else {
            console.warn(`Appointment ${appointment.id} has no patientid`);
          }

          return {
            ...appointment,
            patientId: appointment.patientid, // Mapear a camelCase para compatibilidad
            patientName,
            species,
            ownerName,
          };
        }),
      );

      console.log(
        `Returning ${appointmentsWithDetails.length} appointments with details`,
      );
      return appointmentsWithDetails;
    } catch (error) {
      console.error("Error en findAll:", error);
      throw new Error("Error al obtener citas");
    }
  }

  static async findById(id) {
    try {
      // Obtener la cita y el paciente relacionado
      const { data, error } = await supabase
        .from("appointments")
        .select(`*, patients!inner(name, species, cedula)`) // cedula es la referencia al cliente
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;

      // Buscar el propietario (cliente) usando ownerId
      let ownerName = null;
      if (data.patients && data.patients.cedula) {
        const { data: clientData, error: clientError } = await supabase
          .from("clientes")
          .select("name")
          .eq("cedula", data.patients.cedula)
          .single();
        if (!clientError && clientData) {
          ownerName = clientData.name;
        }
      }

      return {
        ...data,
        patientName: data.patients?.name || "",
        species: data.patients?.species || "",
        ownerName: ownerName || "",
      };
    } catch (error) {
      console.error("Error en Appointment.findById:", error);
      throw new Error("Error al buscar cita por ID");
    }
  }

  static async findByPatientId(patientId) {
    try {
      // Validar que patientId existe
      if (!patientId) {
        console.log("patientId no proporcionado");
        return [];
      }

      // Primero verificar si el paciente existe
      const { data: patientExists, error: patientError } = await supabase
        .from("patients")
        .select("id, name, species, cedula")
        .eq("id", patientId)
        .single();

      if (patientError || !patientExists) {
        console.log(`Paciente ${patientId} no encontrado`);
        return [];
      }

      // Obtener las citas del paciente
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patientid", patientId)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) {
        console.error("Error al obtener citas:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Para cada cita, buscar el propietario (cliente) usando cedula
      const citasConPropietario = await Promise.all(
        data.map(async (appointment) => {
          let ownerName = null;
          if (patientExists.cedula) {
            try {
              const { data: clientData, error: clientError } = await supabase
                .from("clientes")
                .select("name")
                .eq("cedula", patientExists.cedula)
                .single();
              if (!clientError && clientData) {
                ownerName = clientData.name;
              }
            } catch (error) {
              console.error("Error al obtener cliente:", error);
            }
          }
          return {
            ...appointment,
            patientId: appointment.patientid, // Mapear a camelCase
            patientName: patientExists.name || "",
            species: patientExists.species || "",
            ownerName: ownerName || "",
          };
        }),
      );
      return citasConPropietario;
    } catch (error) {
      console.error("Error en Appointment.findByPatientId:", error);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  }

  static async findByDate(date) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("date", date);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error en Appointment.findByDate:", error);
      throw new Error("Error al buscar citas por fecha");
    }
  }

  static async findByStatus(status) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`*, patients!inner(name, species, cedula)`)
        .eq("status", status)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) throw error;

      // Para cada cita, buscar el propietario (cliente) usando ownerId
      const citasConPropietario = await Promise.all(
        (data || []).map(async (appointment) => {
          let ownerName = null;
          if (appointment.patients && appointment.patients.cedula) {
            const { data: clientData, error: clientError } = await supabase
              .from("clientes")
              .select("name")
              .eq("cedula", appointment.patients.cedula)
              .single();
            if (!clientError && clientData) {
              ownerName = clientData.name;
            }
          }
          return {
            ...appointment,
            patientName: appointment.patients?.name || "",
            species: appointment.patients?.species || "",
            ownerName: ownerName || "",
          };
        }),
      );
      return citasConPropietario;
    } catch (error) {
      console.error("Error en Appointment.findByStatus:", error);
      throw new Error("Error al buscar citas por estado");
    }
  }

  static async create(appointmentData) {
    try {
      const { patientId, date, time, type, veterinarian, status, notes } =
        appointmentData;

      console.log("Creating appointment with data:", appointmentData);
      console.log("patientId:", patientId);
      console.log("date received:", date);
      console.log("date type:", typeof date);

      // Validar que no exista cita en la misma fecha y hora para el mismo veterinario
      const { data: existing, error: errorExisting } = await supabase
        .from("appointments")
        .select("id")
        .eq("date", date)
        .eq("time", time)
        .eq("veterinarian", veterinarian);
      if (errorExisting) throw errorExisting;
      if (existing && existing.length > 0) {
        throw new Error("Ya existe una cita en la misma fecha y hora");
      }

      // Validar que el mismo usuario no pueda sacar una cita a la misma hora pero con diferente veterinario
      const { data: existingPatient, error: errorExistingPatient } =
        await supabase
          .from("appointments")
          .select("id")
          .eq("date", date)
          .eq("time", time)
          .eq("patientId", patientId);
      if (errorExistingPatient) throw errorExistingPatient;
      if (existingPatient && existingPatient.length > 0) {
        throw new Error(
          "Ya tiene una cita con otro veterinario en esta fecha y hora",
        );
      }

      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("create_appointment", {
        p_patientid: patientId,
        p_date: date,
        p_time: time,
        p_type: type,
        p_veterinarian: veterinarian,
        p_status: status || "Programada",
        p_notes: notes || null,
      });

      console.log("RPC create_appointment result:", data);
      console.log("RPC error:", error);

      if (error) throw error;

      const newAppointment = Array.isArray(data) ? data[0] : data;

      // Actualizar lastVisit si el status es Completada
      if (status === "Completada" && newAppointment?.id) {
        await supabase
          .from("patients")
          .update({ lastVisit: date })
          .eq("id", patientId);
      }

      return newAppointment?.id
        ? await this.findById(newAppointment.id)
        : newAppointment;
    } catch (error) {
      console.error("Error en Appointment.create:", error);
      // Si el error es por cita duplicada, propagar el mensaje exacto
      if (
        error.message &&
        error.message.includes("Ya existe una cita en la misma fecha y hora")
      ) {
        throw { status: 400, message: error.message };
      }
      throw new Error(error.message || "Error al crear cita");
    }
  }

  static async update(id, appointmentData) {
    try {
      const { patientId, date, time, type, veterinarian, status, notes } =
        appointmentData;

      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("update_appointment", {
        p_id: id,
        p_date: date || null,
        p_time: time || null,
        p_type: type || null,
        p_veterinarian: veterinarian || null,
        p_status: status || null,
        p_notes: notes || null,
      });

      if (error) throw error;
      if (!data || (Array.isArray(data) && data.length === 0)) return null;

      // Actualizar lastVisit si el status es Completada
      if (status === "Completada" && patientId) {
        await supabase
          .from("patients")
          .update({ lastVisit: date })
          .eq("id", patientId);
      }

      return await this.findById(id);
    } catch (error) {
      console.error("Error en Appointment.update:", error);
      throw new Error("Error al actualizar cita");
    }
  }

  static async delete(id) {
    try {
      // Usar función RPC de Supabase
      const { data, error } = await supabase.rpc("delete_appointment", {
        p_id: id,
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error("Error en Appointment.delete:", error);
      throw new Error("Error al eliminar cita");
    }
  }

  static async getStatsByType() {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("type")
        .order("type");

      if (error) throw error;

      const stats = {};
      (data || []).forEach((row) => {
        stats[row.type] = (stats[row.type] || 0) + 1;
      });

      return Object.entries(stats)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error en Appointment.getStatsByType:", error);
      throw new Error("Error al obtener estadísticas por tipo");
    }
  }

  static async getStatsByStatus() {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("status")
        .order("status");

      if (error) throw error;

      const stats = {};
      (data || []).forEach((row) => {
        stats[row.status] = (stats[row.status] || 0) + 1;
      });

      return Object.entries(stats).map(([status, count]) => ({
        status,
        count,
      }));
    } catch (error) {
      console.error("Error en Appointment.getStatsByStatus:", error);
      throw new Error("Error al obtener estadísticas por estado");
    }
  }

  static async count() {
    try {
      const { count, error } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error en Appointment.count:", error);
      throw new Error("Error al contar citas");
    }
  }

  static async countByDate(date) {
    try {
      const { count, error } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("date", date);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error en Appointment.countByDate:", error);
      throw new Error("Error al contar citas por fecha");
    }
  }

  static async attendAppointment(appointmentId, visitData) {
    try {
      // 1. Verificar que la cita existe y está en estado "Programada"
      const { data: appointment, error: aptError } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .single();

      if (aptError || !appointment) {
        throw new Error("Cita no encontrada");
      }

      if (appointment.status !== "Programada") {
        throw new Error("Solo se pueden atender citas en estado Programada");
      }

      // 2. Crear la visita usando la función RPC
      const { data: visitCreated, error: visitError } = await supabase.rpc(
        "create_visit",
        {
          p_patientid: appointment.patientid,
          p_date: visitData.date || appointment.date,
          p_type: visitData.type || appointment.type,
          p_veterinarian: visitData.veterinarian || appointment.veterinarian,
          p_diagnosis: visitData.diagnosis,
          p_treatment: visitData.treatment,
          p_notes: visitData.notes || null,
          p_cost: visitData.cost || 0,
        },
      );

      if (visitError) {
        console.error("Error creating visit:", visitError);
        throw new Error("Error al crear la visita: " + visitError.message);
      }

      // 3. Actualizar el estado de la cita a "Completada"
      const { data: updatedAppointment, error: updateError } = await supabase
        .from("appointments")
        .update({
          status: "Completada",
          updated_date: new Date().toISOString(),
        })
        .eq("id", appointmentId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating appointment:", updateError);
        throw new Error("Error al actualizar la cita: " + updateError.message);
      }

      return {
        appointment: updatedAppointment,
        visit: visitCreated,
      };
    } catch (error) {
      console.error("Error en Appointment.attendAppointment:", error);
      throw error;
    }
  }
}

module.exports = Appointment;
