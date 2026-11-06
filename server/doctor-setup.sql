-- Run these statements in pgAdmin / psql after creating the accounts.
-- Promote an existing account to doctor (replace email).
UPDATE users SET role = 'doctor' WHERE email = 'doctor@example.com';

-- Assign an existing patient account to that doctor (replace both emails).
INSERT INTO doctor_patients (doctor_id, patient_id)
SELECT d.id, p.id FROM users d, users p
WHERE d.email = 'doctor@example.com' AND p.email = 'patient@example.com'
  AND d.role = 'doctor' AND p.role = 'patient'
ON CONFLICT (doctor_id, patient_id) DO NOTHING;
