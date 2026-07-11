# Execution Task List

- [x] **Phase 1: Backend Updates**
  - [x] Update `Patient` database model with `homeAddress` field
  - [x] Modify `sendOtpEmail` in `emailService.js` to log fallbacks and return resolved status on SMTP errors
  - [x] Modify `patientController.js`:
    - [x] `registerPatient` to parse and save `homeAddress`
    - [x] `createAppointment` to add double-booking prevention check
    - [x] Implement `getBookedSlots` controller
  - [x] Modify `adminController.js`:
    - [x] `addPatient` to parse and save `homeAddress`
    - [x] `getPatients` select query to include `homeAddress`
    - [x] `createAppointment` & `updateAppointment` to add double-booking checks
  - [x] Update `patientRoutes.js` with `getBookedSlots` route

- [x] **Phase 2: Next.js Web Frontend Updates**
  - [x] Implement Patient Forgot Password Screen at `frontend/app/patient/forgot-password/page.tsx`
  - [x] Add "Home Address" field to Patient Signup Form (`frontend/app/patient/signup/page.tsx`)
  - [x] Add "Home Address" field to Admin Add Patient Modal (`frontend/components/AddPatientModal.tsx`)
  - [x] Display "Home Address" in Admin Check-in patient table (`frontend/app/admin/check-in/page.tsx`)
  - [x] Disable already booked time slots on Patient Dashboard booking (`frontend/app/patient/dashboard/page.tsx`)
  - [x] Disable already booked time slots on Admin/Staff Appointment scheduling (`frontend/components/AppointmentModal.tsx`)

- [x] **Phase 3: React Native Mobile Frontend Updates**
  - [x] Add "Home Address" field to Patient Signup (`mobile/src/app/signup.tsx`)
  - [x] Disable already booked time slots on mobile booking (`mobile/src/app/(tabs)/appointments.tsx`)

- [x] **Phase 4: Verification & Walkthrough**
  - [x] Manually test each updated flow
  - [x] Create walkthrough summary in `walkthrough.md`
