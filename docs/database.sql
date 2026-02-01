-- ENUMS necesarios
CREATE TYPE gender_type AS ENUM ('Macho', 'Hembra', 'Desconocido');
CREATE TYPE patient_status_type AS ENUM ('Activo', 'Inactivo');
CREATE TYPE appointment_status AS ENUM ('Programada', 'Completada', 'Cancelada');
CREATE TYPE appointment_type AS ENUM ('Consulta', 'Vacunación', 'Cirugía', 'Control', 'Emergencia');
CREATE TYPE visit_type AS ENUM ('Consulta', 'Vacunación', 'Cirugía', 'Control', 'Emergencia');

-- TABLA CLIENTES
CREATE TABLE public.clientes (
  id BIGSERIAL PRIMARY KEY,
  cedula VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  phone VARCHAR,
  address VARCHAR,
  city VARCHAR,
  registrationdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR DEFAULT 'Activo'
);

-- TABLA PACIENTES
CREATE TABLE public.patients (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  species VARCHAR NOT NULL,
  breed VARCHAR NOT NULL,
  age NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  gender gender_type NOT NULL,
  birthdate DATE,
  cedula VARCHAR NOT NULL REFERENCES public.clientes(cedula),
  color VARCHAR,
  allergies TEXT,
  status patient_status_type DEFAULT 'Activo',
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA CITAS
CREATE TABLE public.appointments (
  id BIGSERIAL PRIMARY KEY,
  patientId BIGINT NOT NULL REFERENCES public.patients(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  type appointment_type NOT NULL,
  veterinarian VARCHAR NOT NULL,
  status appointment_status DEFAULT 'Programada',
  notes TEXT,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA VACUNAS
CREATE TABLE public.vaccinations (
  id BIGSERIAL PRIMARY KEY,
  patientId BIGINT NOT NULL REFERENCES public.patients(id),
  date DATE NOT NULL,
  vaccine VARCHAR NOT NULL,
  nextDue DATE NOT NULL,
  veterinarian VARCHAR NOT NULL,
  batchNumber VARCHAR NOT NULL,
  notes TEXT,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA VISITAS
CREATE TABLE public.visits (
  id BIGSERIAL PRIMARY KEY,
  patientId BIGINT NOT NULL REFERENCES public.patients(id),
  date TIMESTAMP NOT NULL,
  type visit_type NOT NULL,
  veterinarian VARCHAR NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  notes TEXT,
  cost NUMERIC NOT NULL DEFAULT 0.00,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA USUARIOS
CREATE TABLE public.usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  telefono VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  rol VARCHAR,
  status VARCHAR,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA ROLES
CREATE TABLE public.roles (
  idRol SERIAL PRIMARY KEY,
  rolName VARCHAR
);