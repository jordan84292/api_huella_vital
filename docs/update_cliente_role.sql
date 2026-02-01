-- Script para agregar el rol "Cliente" a la base de datos
-- Este rol es necesario para que los clientes puedan acceder a la aplicación móvil

-- Agregar el rol Cliente si no existe
INSERT INTO public.roles (idRol, rolName) 
VALUES (5, 'Cliente')
ON CONFLICT (idRol) DO NOTHING;

-- Verificar que el rol se agregó correctamente
SELECT * FROM public.roles ORDER BY idRol;