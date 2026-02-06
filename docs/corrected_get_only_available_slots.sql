CREATE OR REPLACE FUNCTION get_only_available_slots(
    p_veterinarian_name TEXT,
    p_date DATE
)
RETURNS TABLE (
    slot_time TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    v_day_of_week INT;
BEGIN
    -- Obtener el día de la semana (1 para lunes, 7 para domingo)
    v_day_of_week := EXTRACT(DOW FROM p_date)::INT;

    -- Ajustar para que lunes sea 1 y domingo sea 7
    IF v_day_of_week = 0 THEN
        v_day_of_week := 7;
    END IF;

    RETURN QUERY
    SELECT
        bh.start_time AS slot_time,
        NOT EXISTS (
            SELECT 1
            FROM appointments a
            WHERE a.veterinarian_name = p_veterinarian_name
              AND a.date = p_date
              AND a.time = bh.start_time
        ) AS is_available
    FROM business_hours bh
    WHERE bh.day_of_week = v_day_of_week
      AND bh.is_active = TRUE
    ORDER BY bh.start_time;
END;
$$ LANGUAGE plpgsql;