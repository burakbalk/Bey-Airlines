-- generate_weekly_flights fonksiyonunu SECURITY DEFINER olarak güncelle
-- Bu sayede anonim kullanıcılar (siteye giriş yapmamış) da RPC çağrısı yapabilir

DROP FUNCTION IF EXISTS generate_weekly_flights(date, integer);

CREATE OR REPLACE FUNCTION generate_weekly_flights(start_date DATE, num_weeks INT DEFAULT 4)
RETURNS void AS $$
DECLARE
  current_date_iter DATE;
  current_dow INT;
  sched RECORD;
BEGIN
  FOR i IN 0..(num_weeks * 7 - 1) LOOP
    current_date_iter := start_date + i;
    current_dow := EXTRACT(ISODOW FROM current_date_iter);

    FOR sched IN
      SELECT fs.*, a.capacity AS aircraft_capacity
      FROM flight_schedule fs
      JOIN aircraft a ON a.id = fs.aircraft_id
      WHERE fs.is_active = true AND fs.day_of_week = current_dow
    LOOP
      INSERT INTO flights (
        flight_number, schedule_id, aircraft_id, flight_date,
        from_code, from_city, to_code, to_city,
        departure_time, arrival_time, duration,
        flight_class, price, baggage, meal, changeable,
        status, gate, terminal, estimated_departure, estimated_arrival,
        capacity
      ) VALUES (
        sched.flight_code, sched.id, sched.aircraft_id, current_date_iter,
        sched.from_code, sched.from_city, sched.to_code, sched.to_city,
        sched.departure_time, sched.arrival_time, sched.duration,
        sched.flight_class, sched.price, sched.baggage, sched.meal, sched.changeable,
        'zamaninda',
        CASE (sched.id % 6)
          WHEN 0 THEN 'A3' WHEN 1 THEN 'A12' WHEN 2 THEN 'B8'
          WHEN 3 THEN 'C5' WHEN 4 THEN 'D14' WHEN 5 THEN 'B3'
        END,
        CASE WHEN sched.flight_class = 'vip' THEN 'VIP' ELSE '1' END,
        sched.departure_time,
        sched.arrival_time,
        sched.aircraft_capacity
      ) ON CONFLICT (flight_number, flight_date) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
