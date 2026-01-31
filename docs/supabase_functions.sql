-- ===================================================================
-- FUNCIONES Y STORED PROCEDURES PARA SUPABASE
-- Sistema de Gestión Veterinaria
-- ===================================================================
-- Descripción: Funciones SQL para operaciones CRUD usando RPC
-- Fecha: 30 de enero de 2026
-- ===================================================================

-- ===================================================================
-- FUNCIONES PARA USUARIOS
-- ===================================================================

-- Función para crear un nuevo usuario
CREATE OR REPLACE FUNCTION create_usuario(
  p_nombre VARCHAR,
  p_email VARCHAR,
  p_telefono VARCHAR,
  p_password VARCHAR,
  p_rol VARCHAR,
  p_status VARCHAR DEFAULT 'Activo'
)
RETURNS TABLE (
  id INT8,
  nombre VARCHAR,
  email VARCHAR,
  telefono VARCHAR,
  rol VARCHAR,
  status VARCHAR,
  fecha_creacion TIMESTAMPTZ,
  fecha_actualizacion TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO usuarios (nombre, email, telefono, password, rol, status, fecha_creacion, fecha_actualizacion)
  VALUES (p_nombre, p_email, p_telefono, p_password, p_rol, p_status, NOW(), NOW())
  RETURNING usuarios.id, usuarios.nombre, usuarios.email, usuarios.telefono, usuarios.rol, usuarios.status, usuarios.fecha_creacion, usuarios.fecha_actualizacion;
END;
$$;

-- Función para actualizar un usuario
CREATE OR REPLACE FUNCTION update_usuario(
  p_id INT8,
  p_nombre VARCHAR DEFAULT NULL,
  p_email VARCHAR DEFAULT NULL,
  p_telefono VARCHAR DEFAULT NULL,
  p_password VARCHAR DEFAULT NULL,
  p_rol VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id INT8,
  nombre VARCHAR,
  email VARCHAR,
  telefono VARCHAR,
  rol VARCHAR,
  status VARCHAR,
  fecha_creacion TIMESTAMPTZ,
  fecha_actualizacion TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE usuarios
  SET 
    nombre = COALESCE(p_nombre, usuarios.nombre),
    email = COALESCE(p_email, usuarios.email),
    telefono = COALESCE(p_telefono, usuarios.telefono),
    password = COALESCE(p_password, usuarios.password),
    rol = COALESCE(p_rol, usuarios.rol),
    status = COALESCE(p_status, usuarios.status),
    fecha_actualizacion = NOW()
  WHERE usuarios.id = p_id
  RETURNING usuarios.id, usuarios.nombre, usuarios.email, usuarios.telefono, usuarios.rol, usuarios.status, usuarios.fecha_creacion, usuarios.fecha_actualizacion;

  -- Si no se actualizó ninguna fila, devolver un error explícito
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el usuario con el ID %', p_id;
  END IF;
END;
$$;

-- Función para eliminar un usuario
CREATE OR REPLACE FUNCTION delete_usuario(p_id INT8)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM usuarios WHERE id = p_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

-- ===================================================================
-- FUNCIONES PARA PACIENTES
-- ===================================================================

-- Función para crear un nuevo paciente
CREATE OR REPLACE FUNCTION create_patient(
  p_name VARCHAR,
  p_species VARCHAR,
  p_breed VARCHAR,
  p_gender VARCHAR,
  p_birthdate DATE,
  p_weight NUMERIC,
  p_ownerid INT8,
  p_microchip VARCHAR DEFAULT NULL,
  p_color VARCHAR DEFAULT NULL,
  p_allergies TEXT DEFAULT NULL,
  p_status VARCHAR DEFAULT 'Activo'
)
RETURNS TABLE (
  id INT8,
  "name" VARCHAR,
  species VARCHAR,
  breed VARCHAR,
  gender VARCHAR,
  birthdate DATE,
  weight NUMERIC,
  microchip VARCHAR,
  color VARCHAR,
  ownerid INT8,
  allergies TEXT,
  "status" VARCHAR,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO patients ("name", species, breed, gender, birthdate, weight, ownerid, microchip, color, allergies, "status", created_date, updated_date)
  VALUES (p_name, p_species, p_breed, p_gender, p_birthdate, p_weight, p_ownerid, p_microchip, p_color, p_allergies, p_status, NOW(), NOW())
  RETURNING patients.id, patients."name", patients.species, patients.breed, patients.gender, patients.birthdate, patients.weight, patients.microchip, patients.color, patients.ownerid, patients.allergies, patients."status", patients.created_date, patients.updated_date;
END;
$$;

-- Función para actualizar un paciente
CREATE OR REPLACE FUNCTION update_patient(
  p_id INT8,
  p_name VARCHAR DEFAULT NULL,
  p_species VARCHAR DEFAULT NULL,
  p_breed VARCHAR DEFAULT NULL,
  p_gender VARCHAR DEFAULT NULL,
  p_birthdate DATE DEFAULT NULL,
  p_weight NUMERIC DEFAULT NULL,
  p_microchip VARCHAR DEFAULT NULL,
  p_color VARCHAR DEFAULT NULL,
  p_allergies TEXT DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id INT8,
  "name" VARCHAR,
  species VARCHAR,
  breed VARCHAR,
  gender VARCHAR,
  birthdate DATE,
  weight NUMERIC,
  microchip VARCHAR,
  color VARCHAR,
  ownerid INT8,
  allergies TEXT,
  "status" VARCHAR,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE patients
  SET 
    "name" = COALESCE(p_name, patients."name"),
    species = COALESCE(p_species, patients.species),
    breed = COALESCE(p_breed, patients.breed),
    gender = COALESCE(p_gender, patients.gender),
    birthdate = COALESCE(p_birthdate, patients.birthdate),
    weight = COALESCE(p_weight, patients.weight),
    microchip = COALESCE(p_microchip, patients.microchip),
    color = COALESCE(p_color, patients.color),
    allergies = COALESCE(p_allergies, patients.allergies),
    "status" = COALESCE(p_status, patients."status"),
    updated_date = NOW()
  WHERE patients.id = p_id
  RETURNING patients.id, patients."name", patients.species, patients.breed, patients.gender, patients.birthdate, patients.weight, patients.microchip, patients.color, patients.ownerid, patients.allergies, patients."status", patients.created_date, patients.updated_date;
END;
$$;

-- Función para eliminar un paciente
CREATE OR REPLACE FUNCTION delete_patient(p_id INT8)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM patients WHERE id = p_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

-- ===================================================================
-- FUNCIONES PARA CITAS (APPOINTMENTS)
-- ===================================================================

-- Función para crear una nueva cita
CREATE OR REPLACE FUNCTION create_appointment(
  p_patientid INT8,
  p_date DATE,
  p_time TIME,
  p_type VARCHAR,
  p_veterinarian VARCHAR,
  p_status VARCHAR DEFAULT 'Programada',
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INT8,
  patientid INT8,
  "date" DATE,
  "time" TIME,
  "type" VARCHAR,
  veterinarian VARCHAR,
  "status" VARCHAR,
  notes TEXT,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO appointments (patientid, "date", "time", "type", veterinarian, "status", notes, created_date, updated_date)
  VALUES (p_patientid, p_date, p_time, p_type, p_veterinarian, p_status, p_notes, NOW(), NOW())
  RETURNING appointments.id, appointments.patientid, appointments."date", appointments."time", appointments."type", appointments.veterinarian, appointments."status", appointments.notes, appointments.created_date, appointments.updated_date;
END;
$$;

-- Función para actualizar una cita
CREATE OR REPLACE FUNCTION update_appointment(
  p_id INT8,
  p_date DATE DEFAULT NULL,
  p_time TIME DEFAULT NULL,
  p_type VARCHAR DEFAULT NULL,
  p_veterinarian VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INT8,
  patientid INT8,
  "date" DATE,
  "time" TIME,
  "type" VARCHAR,
  veterinarian VARCHAR,
  "status" VARCHAR,
  notes TEXT,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE appointments
  SET 
    "date" = COALESCE(p_date, appointments."date"),
    "time" = COALESCE(p_time, appointments."time"),
    "type" = COALESCE(p_type, appointments."type"),
    veterinarian = COALESCE(p_veterinarian, appointments.veterinarian),
    "status" = COALESCE(p_status, appointments."status"),
    notes = COALESCE(p_notes, appointments.notes),
    updated_date = NOW()
  WHERE appointments.id = p_id
  RETURNING appointments.id, appointments.patientid, appointments."date", appointments."time", appointments."type", appointments.veterinarian, appointments."status", appointments.notes, appointments.created_date, appointments.updated_date;
END;
$$;

-- Función para eliminar una cita
CREATE OR REPLACE FUNCTION delete_appointment(p_id INT8)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM appointments WHERE id = p_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

-- ===================================================================
-- FUNCIONES PARA VACUNACIONES
-- ===================================================================

-- Función para crear una nueva vacunación
CREATE OR REPLACE FUNCTION create_vaccination(
  p_patientid INT8,
  p_vaccine VARCHAR,
  p_date DATE,
  p_nextdue DATE,
  p_batchnumber VARCHAR DEFAULT NULL,
  p_veterinarian VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INT8,
  patientid INT8,
  vaccine VARCHAR,
  "date" DATE,
  nextdue DATE,
  batchnumber VARCHAR,
  veterinarian VARCHAR,
  notes TEXT,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO vaccinations (patientid, vaccine, "date", nextdue, batchnumber, veterinarian, notes, created_date, updated_date)
  VALUES (p_patientid, p_vaccine, p_date, p_nextdue, p_batchnumber, p_veterinarian, p_notes, NOW(), NOW())
  RETURNING vaccinations.id, vaccinations.patientid, vaccinations.vaccine, vaccinations."date", vaccinations.nextdue, vaccinations.batchnumber, vaccinations.veterinarian, vaccinations.notes, vaccinations.created_date, vaccinations.updated_date;
END;
$$;

-- Función para actualizar una vacunación
CREATE OR REPLACE FUNCTION update_vaccination(
  p_id INT8,
  p_vaccine VARCHAR DEFAULT NULL,
  p_date DATE DEFAULT NULL,
  p_nextdue DATE DEFAULT NULL,
  p_batchnumber VARCHAR DEFAULT NULL,
  p_veterinarian VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INT8,
  patientid INT8,
  vaccine VARCHAR,
  "date" DATE,
  nextdue DATE,
  batchnumber VARCHAR,
  veterinarian VARCHAR,
  notes TEXT,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE vaccinations
  SET 
    vaccine = COALESCE(p_vaccine, vaccinations.vaccine),
    "date" = COALESCE(p_date, vaccinations."date"),
    nextdue = COALESCE(p_nextdue, vaccinations.nextdue),
    batchnumber = COALESCE(p_batchnumber, vaccinations.batchnumber),
    veterinarian = COALESCE(p_veterinarian, vaccinations.veterinarian),
    notes = COALESCE(p_notes, vaccinations.notes),
    updated_date = NOW()
  WHERE vaccinations.id = p_id
  RETURNING vaccinations.id, vaccinations.patientid, vaccinations.vaccine, vaccinations."date", vaccinations.nextdue, vaccinations.batchnumber, vaccinations.veterinarian, vaccinations.notes, vaccinations.created_date, vaccinations.updated_date;
END;
$$;

-- Función para eliminar una vacunación
CREATE OR REPLACE FUNCTION delete_vaccination(p_id INT8)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM vaccinations WHERE id = p_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

-- ===================================================================
-- FUNCIONES PARA VISITAS
-- ===================================================================

-- Función para crear una nueva visita
CREATE OR REPLACE FUNCTION create_visit(
  p_patientid INT8,
  p_date DATE,
  p_reason VARCHAR,
  p_diagnosis TEXT,
  p_treatment TEXT,
  p_veterinarian VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INT8,
  patientid INT8,
  "date" DATE,
  reason VARCHAR,
  diagnosis TEXT,
  treatment TEXT,
  veterinarian VARCHAR,
  notes TEXT,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO visits (patientid, "date", reason, diagnosis, treatment, veterinarian, notes, created_date, updated_date)
  VALUES (p_patientid, p_date, p_reason, p_diagnosis, p_treatment, p_veterinarian, p_notes, NOW(), NOW())
  RETURNING visits.id, visits.patientid, visits."date", visits.reason, visits.diagnosis, visits.treatment, visits.veterinarian, visits.notes, visits.created_date, visits.updated_date;
END;
$$;

-- Función para actualizar una visita
CREATE OR REPLACE FUNCTION update_visit(
  p_id INT8,
  p_date DATE DEFAULT NULL,
  p_reason VARCHAR DEFAULT NULL,
  p_diagnosis TEXT DEFAULT NULL,
  p_treatment TEXT DEFAULT NULL,
  p_veterinarian VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INT8,
  patientid INT8,
  "date" DATE,
  reason VARCHAR,
  diagnosis TEXT,
  treatment TEXT,
  veterinarian VARCHAR,
  notes TEXT,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE visits
  SET 
    "date" = COALESCE(p_date, visits."date"),
    reason = COALESCE(p_reason, visits.reason),
    diagnosis = COALESCE(p_diagnosis, visits.diagnosis),
    treatment = COALESCE(p_treatment, visits.treatment),
    veterinarian = COALESCE(p_veterinarian, visits.veterinarian),
    notes = COALESCE(p_notes, visits.notes),
    updated_date = NOW()
  WHERE visits.id = p_id
  RETURNING visits.id, visits.patientid, visits."date", visits.reason, visits.diagnosis, visits.treatment, visits.veterinarian, visits.notes, visits.created_date, visits.updated_date;
END;
$$;

-- Función para eliminar una visita
CREATE OR REPLACE FUNCTION delete_visit(p_id INT8)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM visits WHERE id = p_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

-- ===================================================================
-- FUNCIONES PARA CLIENTES
-- ===================================================================

-- Función para crear un nuevo cliente
CREATE OR REPLACE FUNCTION create_cliente(
  p_name VARCHAR,
  p_email VARCHAR,
  p_phone VARCHAR,
  p_adir VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT 'Activo'
)
RETURNS TABLE (
  id INT8,
  "name" VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  adir VARCHAR,
  city VARCHAR,
  registrationdate TIMESTAMPTZ,
  "status" VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO clientes ("name", email, phone, adir, city, registrationdate, "status")
  VALUES (p_name, p_email, p_phone, p_adir, p_city, NOW(), p_status)
  RETURNING clientes.id, clientes."name", clientes.email, clientes.phone, clientes.adir, clientes.city, clientes.registrationdate, clientes."status";
END;
$$;

-- Función para actualizar un cliente
CREATE OR REPLACE FUNCTION update_cliente(
  p_id INT8,
  p_name VARCHAR DEFAULT NULL,
  p_email VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_adir VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id INT8,
  "name" VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  adir VARCHAR,
  city VARCHAR,
  registrationdate TIMESTAMPTZ,
  "status" VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE clientes
  SET 
    "name" = COALESCE(p_name, clientes."name"),
    email = COALESCE(p_email, clientes.email),
    phone = COALESCE(p_phone, clientes.phone),
    adir = COALESCE(p_adir, clientes.adir),
    city = COALESCE(p_city, clientes.city),
    "status" = COALESCE(p_status, clientes."status")
  WHERE clientes.id = p_id
  RETURNING clientes.id, clientes."name", clientes.email, clientes.phone, clientes.adir, clientes.city, clientes.registrationdate, clientes."status";
END;
$$;

-- Función para eliminar un cliente
CREATE OR REPLACE FUNCTION delete_cliente(p_id INT8)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM clientes WHERE id = p_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

-- ===================================================================
-- INSTRUCCIONES PARA SUPABASE
-- ===================================================================
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
-- 5. Las funciones estarán disponibles para usar con .rpc() en tu código
-- ===================================================================
