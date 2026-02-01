-- =========================
-- FUNCIONES DE CREACIÓN
-- =========================

-- Crear paciente
CREATE OR REPLACE FUNCTION create_patient(
  p_name VARCHAR,
  p_species VARCHAR,
  p_breed VARCHAR,
  p_gender gender_type,
  p_birthdate DATE,
  p_age NUMERIC,
  p_weight NUMERIC,
  p_cedula VARCHAR,
  p_color VARCHAR DEFAULT NULL,
  p_allergies TEXT DEFAULT NULL,
  p_status patient_status_type DEFAULT 'Activo'
)
RETURNS TABLE (
  id BIGINT,
  name VARCHAR,
  species VARCHAR,
  breed VARCHAR,
  gender gender_type,
  birthdate DATE,
  age NUMERIC,
  weight NUMERIC,
  color VARCHAR,
  cedula VARCHAR,
  allergies TEXT,
  status patient_status_type,
  created_date TIMESTAMP,
  updated_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO patients (name, species, breed, gender, birthdate, age, weight, cedula, color, allergies, status, created_date, updated_date)
  VALUES (p_name, p_species, p_breed, p_gender, p_birthdate, p_age, p_weight, p_cedula, p_color, p_allergies, p_status, NOW(), NOW())
  RETURNING patients.id, patients.name, patients.species, patients.breed, patients.gender, patients.birthdate, patients.age, patients.weight, patients.color, patients.cedula, patients.allergies, patients.status, patients.created_date, patients.updated_date;
END;
$$;

-- Crear cliente
CREATE OR REPLACE FUNCTION create_cliente(
  p_cedula VARCHAR,
  p_name VARCHAR,
  p_email VARCHAR,
  p_phone VARCHAR DEFAULT NULL,
  p_address VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT 'Activo'
)
RETURNS TABLE (
  id BIGINT,
  cedula VARCHAR,
  name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  address VARCHAR,
  city VARCHAR,
  registrationdate TIMESTAMP,
  status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO clientes (cedula, name, email, phone, address, city, registrationdate, status)
  VALUES (p_cedula, p_name, p_email, p_phone, p_address, p_city, NOW(), p_status)
  RETURNING clientes.id, clientes.cedula, clientes.name, clientes.email, clientes.phone, clientes.address, clientes.city, clientes.registrationdate, clientes.status;
END;
$$;

-- Crear cita (appointment)
CREATE OR REPLACE FUNCTION create_appointment(
  p_patientid BIGINT,
  p_date DATE,
  p_time TIME,
  p_type appointment_type,
  p_veterinarian VARCHAR,
  p_status appointment_status DEFAULT 'Programada',
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  patientid BIGINT,
  date DATE,
  "time" TIME,
  type appointment_type,
  veterinarian VARCHAR,
  status appointment_status,
  notes TEXT,
  created_date TIMESTAMP,
  updated_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO appointments (patientId, date, time, type, veterinarian, status, notes, created_date, updated_date)
  VALUES (p_patientid, p_date, p_time, p_type, p_veterinarian, p_status, p_notes, NOW(), NOW())
  RETURNING appointments.id, appointments.patientId, appointments.date, appointments.time, appointments.type, appointments.veterinarian, appointments.status, appointments.notes, appointments.created_date, appointments.updated_date;
END;
$$;

-- Crear vacunación
CREATE OR REPLACE FUNCTION create_vaccination(
  p_patientid BIGINT,
  p_vaccine VARCHAR,
  p_date DATE,
  p_nextdue DATE,
  p_batchnumber VARCHAR,
  p_veterinarian VARCHAR,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  patientid BIGINT,
  vaccine VARCHAR,
  date DATE,
  nextdue DATE,
  batchnumber VARCHAR,
  veterinarian VARCHAR,
  notes TEXT,
  created_date TIMESTAMP,
  updated_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO vaccinations (patientId, vaccine, date, nextDue, batchNumber, veterinarian, notes, created_date, updated_date)
  VALUES (p_patientid, p_vaccine, p_date, p_nextdue, p_batchnumber, p_veterinarian, p_notes, NOW(), NOW())
  RETURNING id, patientId, vaccine, date, nextDue, batchNumber, veterinarian, notes, created_date, updated_date;
END;
$$;

-- Crear visita
CREATE OR REPLACE FUNCTION create_visit(
  p_patientid BIGINT,
  p_date TIMESTAMP,
  p_type visit_type,
  p_veterinarian VARCHAR,
  p_diagnosis TEXT,
  p_treatment TEXT,
  p_notes TEXT DEFAULT NULL,
  p_cost NUMERIC DEFAULT 0.00
)
RETURNS TABLE (
  id BIGINT,
  patientid BIGINT,
  date TIMESTAMP,
  type visit_type,
  veterinarian VARCHAR,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  cost NUMERIC,
  created_date TIMESTAMP,
  updated_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO visits (patientId, date, type, veterinarian, diagnosis, treatment, notes, cost, created_date, updated_date)
  VALUES (p_patientid, p_date, p_type, p_veterinarian, p_diagnosis, p_treatment, p_notes, p_cost, NOW(), NOW())
  RETURNING id, patientId, date, type, veterinarian, diagnosis, treatment, notes, cost, created_date, updated_date;
END;
$$;

-- Eliminar función si existe
DROP FUNCTION IF EXISTS create_usuario(
  VARCHAR,
  VARCHAR,
  VARCHAR,
  VARCHAR,
  VARCHAR,
  VARCHAR
);

-- Crear usuario (corregido)
CREATE OR REPLACE FUNCTION create_usuario(
  p_nombre VARCHAR,
  p_email VARCHAR,
  p_telefono VARCHAR,
  p_password VARCHAR,
  p_rol VARCHAR,
  p_status VARCHAR DEFAULT 'Activo'
)
RETURNS TABLE (
  id BIGINT,
  nombre VARCHAR,
  email VARCHAR,
  telefono VARCHAR,
  password VARCHAR,
  rol VARCHAR,
  status VARCHAR,
  fecha_creacion TIMESTAMP,
  fecha_actualizacion TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO usuarios (nombre, email, telefono, password, rol, status, fecha_creacion, fecha_actualizacion)
  VALUES (p_nombre, p_email, p_telefono, p_password, p_rol, p_status, NOW(), NOW())
  RETURNING usuarios.id, usuarios.nombre, usuarios.email, usuarios.telefono, usuarios.password, usuarios.rol, usuarios.status, usuarios.fecha_creacion, usuarios.fecha_actualizacion;
END;
$$;

-- =========================
-- FUNCIONES DE ACTUALIZACIÓN
-- =========================

-- Actualizar paciente
-- Eliminar la función si existe antes de crearla
DROP FUNCTION IF EXISTS update_patient(
  BIGINT,
  VARCHAR,
  VARCHAR,
  VARCHAR,
  gender_type,
  DATE,
  NUMERIC,
  NUMERIC,
  VARCHAR,
  VARCHAR,
  TEXT,
  patient_status_type
);

CREATE OR REPLACE FUNCTION update_patient(
  p_id BIGINT,
  p_name VARCHAR DEFAULT NULL,
  p_species VARCHAR DEFAULT NULL,
  p_breed VARCHAR DEFAULT NULL,
  p_gender gender_type DEFAULT NULL,
  p_birthdate DATE DEFAULT NULL,
  p_age NUMERIC DEFAULT NULL,
  p_weight NUMERIC DEFAULT NULL,
  p_cedula VARCHAR DEFAULT NULL,
  p_color VARCHAR DEFAULT NULL,
  p_allergies TEXT DEFAULT NULL,
  p_status patient_status_type DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  name VARCHAR,
  species VARCHAR,
  breed VARCHAR,
  gender gender_type,
  birthdate DATE,
  age NUMERIC,
  weight NUMERIC,
  color VARCHAR,
  cedula VARCHAR,
  allergies TEXT,
  status patient_status_type,
  created_date TIMESTAMP,
  updated_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE patients
  SET
    name = COALESCE(p_name, name),
    species = COALESCE(p_species, species),
    breed = COALESCE(p_breed, breed),
    gender = COALESCE(p_gender, gender),
    birthdate = COALESCE(p_birthdate, birthdate),
    age = COALESCE(p_age, age),
    weight = COALESCE(p_weight, weight),
    cedula = COALESCE(p_cedula, cedula),
    color = COALESCE(p_color, color),
    allergies = COALESCE(p_allergies, allergies),
    status = COALESCE(p_status, status),
    updated_date = NOW()
  WHERE patients.id = p_id
  RETURNING patients.id, patients.name, patients.species, patients.breed, patients.gender, patients.birthdate, patients.age, patients.weight, patients.color, patients.cedula, patients.allergies, patients.status, patients.created_date, patients.updated_date;
END;
$$;

-- Actualizar cliente
CREATE OR REPLACE FUNCTION update_cliente(
  p_id BIGINT,
  p_cedula VARCHAR DEFAULT NULL,
  p_name VARCHAR DEFAULT NULL,
  p_email VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_address VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  cedula VARCHAR,
  name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  address VARCHAR,
  city VARCHAR,
  registrationdate TIMESTAMP,
  status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE clientes
  SET
    cedula = COALESCE(p_cedula, clientes.cedula),
    name = COALESCE(p_name, clientes.name),
    email = COALESCE(p_email, clientes.email),
    phone = COALESCE(p_phone, clientes.phone),
    address = COALESCE(p_address, clientes.address),
    city = COALESCE(p_city, clientes.city),
    status = COALESCE(p_status, clientes.status)
  WHERE clientes.id = p_id
  RETURNING clientes.id, clientes.cedula, clientes.name, clientes.email, clientes.phone, clientes.address, clientes.city, clientes.registrationdate, clientes.status;
END;
$$;

-- Actualizar cita
CREATE OR REPLACE FUNCTION update_appointment(
  p_id BIGINT,
  p_date DATE DEFAULT NULL,
  p_time TIME DEFAULT NULL,
  p_type appointment_type DEFAULT NULL,
  p_veterinarian VARCHAR DEFAULT NULL,
  p_status appointment_status DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  patientid BIGINT,
  date DATE,
  "time" TIME,
  type appointment_type,
  veterinarian VARCHAR,
  status appointment_status,
  notes TEXT,
  created_date TIMESTAMP,
  updated_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE appointments
  SET
    date = COALESCE(p_date, date),
    time = COALESCE(p_time, time),
    type = COALESCE(p_type, type),
    veterinarian = COALESCE(p_veterinarian, veterinarian),
    status = COALESCE(p_status, status),
    notes = COALESCE(p_notes, notes),
    updated_date = NOW()
  WHERE appointments.id = p_id
  RETURNING id, patientId, date, time, type, veterinarian, status, notes, created_date, updated_date;
END;
$$;

-- Actualizar vacunación
CREATE OR REPLACE FUNCTION update_vaccination(
  p_id BIGINT,
  p_vaccine VARCHAR DEFAULT NULL,
  p_date DATE DEFAULT NULL,
  p_nextdue DATE DEFAULT NULL,
  p_batchnumber VARCHAR DEFAULT NULL,
  p_veterinarian VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  patientid BIGINT,
  vaccine VARCHAR,
  date DATE,
  nextdue DATE,
  batchnumber VARCHAR,
  veterinarian VARCHAR,
  notes TEXT,
  created_date TIMESTAMP,
  updated_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE vaccinations
  SET
    vaccine = COALESCE(p_vaccine, vaccine),
    date = COALESCE(p_date, date),
    nextDue = COALESCE(p_nextdue, nextDue),
    batchNumber = COALESCE(p_batchnumber, batchNumber),
    veterinarian = COALESCE(p_veterinarian, veterinarian),
    notes = COALESCE(p_notes, notes),
    updated_date = NOW()
  WHERE id = p_id
  RETURNING id, patientId, vaccine, date, nextDue, batchNumber, veterinarian, notes, created_date, updated_date;
END;
$$;

-- Actualizar visita
CREATE OR REPLACE FUNCTION update_visit(
  p_id BIGINT,
  p_date TIMESTAMP DEFAULT NULL,
  p_type visit_type DEFAULT NULL,
  p_veterinarian VARCHAR DEFAULT NULL,
  p_diagnosis TEXT DEFAULT NULL,
  p_treatment TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_cost NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  patientid BIGINT,
  date TIMESTAMP,
  type visit_type,
  veterinarian VARCHAR,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  cost NUMERIC,
  created_date TIMESTAMP,
  updated_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE visits
  SET
    date = COALESCE(p_date, date),
    type = COALESCE(p_type, type),
    veterinarian = COALESCE(p_veterinarian, veterinarian),
    diagnosis = COALESCE(p_diagnosis, diagnosis),
    treatment = COALESCE(p_treatment, treatment),
    notes = COALESCE(p_notes, notes),
    cost = COALESCE(p_cost, cost),
    updated_date = NOW()
  WHERE id = p_id
  RETURNING id, patientId, date, type, veterinarian, diagnosis, treatment, notes, cost, created_date, updated_date;
END;
$$;

-- Actualizar usuario
CREATE OR REPLACE FUNCTION update_usuario(
  p_id BIGINT,
  p_nombre VARCHAR DEFAULT NULL,
  p_email VARCHAR DEFAULT NULL,
  p_telefono VARCHAR DEFAULT NULL,
  p_password VARCHAR DEFAULT NULL,
  p_rol VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  nombre VARCHAR,
  email VARCHAR,
  telefono VARCHAR,
  password VARCHAR,
  rol VARCHAR,
  status VARCHAR,
  fecha_creacion TIMESTAMP,
  fecha_actualizacion TIMESTAMP
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
  RETURNING usuarios.id, usuarios.nombre, usuarios.email, usuarios.telefono, usuarios.password, usuarios.rol, usuarios.status, usuarios.fecha_creacion, usuarios.fecha_actualizacion;
END;
$$;

-- =========================
-- FUNCIONES DE ELIMINACIÓN
-- =========================

-- Eliminar paciente
CREATE OR REPLACE FUNCTION delete_patient(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM patients WHERE id = p_id;
  RETURN TRUE;
END;
$$;

-- Eliminar cliente
CREATE OR REPLACE FUNCTION delete_cliente(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM clientes WHERE id = p_id;
  RETURN TRUE;
END;
$$;

-- Eliminar cita
CREATE OR REPLACE FUNCTION delete_appointment(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM appointments WHERE id = p_id;
  RETURN TRUE;
END;
$$;

-- Eliminar vacunación
CREATE OR REPLACE FUNCTION delete_vaccination(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM vaccinations WHERE id = p_id;
  RETURN TRUE;
END;
$$;

-- Eliminar visita
CREATE OR REPLACE FUNCTION delete_visit(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM visits WHERE id = p_id;
  RETURN TRUE;
END;
$$;

-- Eliminar usuario
CREATE OR REPLACE FUNCTION delete_usuario(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM usuarios WHERE id = p_id;
  RETURN TRUE;
END;
$$;