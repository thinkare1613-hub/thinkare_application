import { describe, expect, it } from 'vitest';
import { validatePatientDoctorClinicMatch } from './clinicValidation';

describe('clinic validation', () => {
  it('allows a patient and doctor from the same clinic', () => {
    expect(validatePatientDoctorClinicMatch('clinic-demo-1', 'clinic-demo-1')).toBeNull();
  });

  it('rejects patient and doctor from different clinics', () => {
    expect(validatePatientDoctorClinicMatch('clinic-demo-1', 'clinic-demo-2')).toBe(
      'This patient can only be assigned to a doctor from the same clinic.'
    );
  });
});
