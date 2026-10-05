-- === PART A: SCHEMA ===

CREATE TABLE IF NOT EXISTS pending_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number text NOT NULL,
  subject_code text NOT NULL,
  theory_attended int NOT NULL,
  theory_total int NOT NULL,
  practical_attended int NOT NULL,
  practical_total int NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (roll_number, subject_code)
);

CREATE OR REPLACE FUNCTION apply_pending_baselines()
RETURNS TRIGGER AS \$\$
BEGIN
  INSERT INTO student_historical_attendance (
    student_id, subject_code,
    theory_attended, theory_total,
    practical_attended, practical_total,
    is_one_time_set, source, verified_by_user
  )
  SELECT
    NEW.id, p.subject_code,
    p.theory_attended, p.theory_total,
    p.practical_attended, p.practical_total,
    true, 'BULK_CSV', true
  FROM pending_baselines p
  WHERE p.roll_number = NEW.roll_number
    AND NOT EXISTS (
      SELECT 1 FROM student_historical_attendance s
      WHERE s.student_id = NEW.id
        AND s.subject_code = p.subject_code
    );

  DELETE FROM pending_baselines WHERE roll_number = NEW.roll_number;
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_apply_pending_baselines ON users;
CREATE TRIGGER trigger_apply_pending_baselines
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION apply_pending_baselines();

-- === PART B: DATA ===

-- MICRO
INSERT INTO pending_baselines
  (roll_number, subject_code, theory_attended, theory_total, practical_attended, practical_total)
VALUES
  ('24014','MICRO',90,106,33,37),
  ('24020','MICRO',81,107,30,38),
  ('24032','MICRO',83,107,30,38),
  ('24049','MICRO',79,107,34,36),
  ('24083','MICRO',78,107,29,39),
  ('24088','MICRO',97,107,36,39),
  ('24101','MICRO',95,107,38,39),
  ('24104','MICRO',96,107,38,39),
  ('24107','MICRO',95,107,32,39),
  ('24108','MICRO',92,107,30,39),
  ('21114','MICRO',94,107,36,39),
  ('22064','MICRO',91,107,35,39),
  ('23033','MICRO',60,107,20,39),
  ('23065','MICRO',104,107,38,39)
ON CONFLICT (roll_number, subject_code) DO UPDATE SET
  theory_attended    = EXCLUDED.theory_attended,
  theory_total       = EXCLUDED.theory_total,
  practical_attended = EXCLUDED.practical_attended,
  practical_total    = EXCLUDED.practical_total;

-- PATH
INSERT INTO pending_baselines
  (roll_number, subject_code, theory_attended, theory_total, practical_attended, practical_total)
VALUES
  ('24014','PATH',129,146,33,36),
  ('24020','PATH',115,148,30,38),
  ('24032','PATH',110,148,30,38),
  ('24049','PATH',115,148,30,37),
  ('24083','PATH',116,148,26,35),
  ('24088','PATH',117,148,33,35),
  ('24101','PATH',128,148,33,35),
  ('24104','PATH',129,148,33,35),
  ('24107','PATH',136,148,33,35),
  ('24108','PATH',113,148,25,35),
  ('21114','PATH',128,148,31,35),
  ('22064','PATH',129,148,33,35),
  ('23033','PATH',68,148,30,35),
  ('23065','PATH',138,148,34,35)
ON CONFLICT (roll_number, subject_code) DO UPDATE SET
  theory_attended    = EXCLUDED.theory_attended,
  theory_total       = EXCLUDED.theory_total,
  practical_attended = EXCLUDED.practical_attended,
  practical_total    = EXCLUDED.practical_total;

-- PHARMA
INSERT INTO pending_baselines
  (roll_number, subject_code, theory_attended, theory_total, practical_attended, practical_total)
VALUES
  ('24014','PHARMA',120,145,31,34),
  ('24020','PHARMA',106,145,26,34),
  ('24032','PHARMA',115,145,27,34),
  ('24049','PHARMA',107,145,31,38),
  ('24083','PHARMA',106,145,27,34),
  ('24088','PHARMA',124,145,29,34),
  ('24101','PHARMA',127,145,30,34),
  ('24104','PHARMA',129,145,33,34),
  ('24107','PHARMA',130,145,31,34),
  ('24108','PHARMA',107,145,26,34),
  ('21114','PHARMA',127,145,32,34),
  ('22064','PHARMA',128,145,30,34),
  ('23033','PHARMA',67,123,21,30),
  ('23065','PHARMA',140,145,32,34)
ON CONFLICT (roll_number, subject_code) DO UPDATE SET
  theory_attended    = EXCLUDED.theory_attended,
  theory_total       = EXCLUDED.theory_total,
  practical_attended = EXCLUDED.practical_attended,
  practical_total    = EXCLUDED.practical_total;

-- === PART C: VERIFY ===
-- Run this to check totals:
-- SELECT subject_code, COUNT(*) FROM pending_baselines GROUP BY subject_code;
