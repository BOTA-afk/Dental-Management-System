import express from 'express';
import {
  registerPatient,
  loginPatient,
  getPatientProfile,
  updatePatientProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getDentists,
  getAppointments,
  createAppointment,
  cancelAppointment,
  getNotifications,
  markNotificationAsRead,
  getBills,
  payBill,
  createCheckoutSession,
  getBookedSlots,
  getPatientTreatmentPlans,
  getPatientXRays,
  getPatientPrescriptions
} from '../controllers/patientController.js';
import { verifyToken, isPatient } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', registerPatient);
router.post('/login', loginPatient);
router.get('/profile', verifyToken, isPatient, getPatientProfile);
router.put('/profile', verifyToken, isPatient, updatePatientProfile);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Appointment routes
router.get('/dentists', verifyToken, isPatient, getDentists);
router.get('/appointments/booked-slots', verifyToken, isPatient, getBookedSlots);
router.get('/appointments', verifyToken, isPatient, getAppointments);
router.post('/appointments', verifyToken, isPatient, createAppointment);
router.put('/appointments/:id/cancel', verifyToken, isPatient, cancelAppointment);

// Notifications & Billing routes
router.get('/notifications', verifyToken, isPatient, getNotifications);
router.put('/notifications/read', verifyToken, isPatient, markNotificationAsRead);
router.get('/billing', verifyToken, isPatient, getBills);
router.post('/billing/:id/checkout-session', verifyToken, isPatient, createCheckoutSession);
router.put('/billing/:id/pay', verifyToken, isPatient, payBill);

// Treatment Plans, X-Rays & Prescriptions routes for Patients
router.get('/treatment-plans', verifyToken, isPatient, getPatientTreatmentPlans);
router.get('/xrays', verifyToken, isPatient, getPatientXRays);
router.get('/prescriptions', verifyToken, isPatient, getPatientPrescriptions);

export default router;