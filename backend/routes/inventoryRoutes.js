import express from 'express';
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  restockItem,
  recordUsage,
  getInventoryLogs,
  getInventoryStatusReport,
  getInventoryReportPdf,
  createSupplyRequest,
  getSupplyRequests,
  updateSupplyRequestStatus,
  createTask,
  getTasks,
  updateTaskStatus,
  getAssistantNotifications,
  markAssistantNotificationsAsRead,
  getLowStockItems,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierOrders,
  createSupplierOrder,
  receiveSupplierOrder
} from '../controllers/inventoryController.js';
import { verifyToken, isStaff, isAdminOrAssistant } from '../middleware/authMiddleware.js';

const router = express.Router();

// Inventory Items
router.get('/', verifyToken, isStaff, getInventory);
router.post('/', verifyToken, isAdminOrAssistant, addInventoryItem);
router.get('/low-stock', verifyToken, isStaff, getLowStockItems);
router.put('/:id', verifyToken, isAdminOrAssistant, updateInventoryItem);
router.delete('/:id', verifyToken, isAdminOrAssistant, deleteInventoryItem);

// Stock Actions
router.post('/:id/restock', verifyToken, isAdminOrAssistant, restockItem);
router.post('/:id/use', verifyToken, isAdminOrAssistant, recordUsage);

// History Logs & Reports
router.get('/logs', verifyToken, isStaff, getInventoryLogs);
router.get('/report', verifyToken, isStaff, getInventoryStatusReport);
router.get('/report/pdf', verifyToken, isStaff, getInventoryReportPdf);

// Suppliers Directory
router.get('/suppliers', verifyToken, isStaff, getSuppliers);
router.post('/suppliers', verifyToken, isAdminOrAssistant, createSupplier);
router.put('/suppliers/:id', verifyToken, isAdminOrAssistant, updateSupplier);
router.delete('/suppliers/:id', verifyToken, isAdminOrAssistant, deleteSupplier);

// Supplier Orders (with 5-day delivery email notice)
router.get('/supplier-orders', verifyToken, isStaff, getSupplierOrders);
router.post('/supplier-orders', verifyToken, isAdminOrAssistant, createSupplierOrder);
router.put('/supplier-orders/:id/receive', verifyToken, isAdminOrAssistant, receiveSupplierOrder);

// Dentist Supply Requests
router.get('/requests', verifyToken, isStaff, getSupplyRequests);
router.post('/requests', verifyToken, isStaff, createSupplyRequest); // Dentist role validated inside controller
router.put('/requests/:id', verifyToken, isAdminOrAssistant, updateSupplyRequestStatus);

// Assistant Tasks
router.get('/tasks', verifyToken, isStaff, getTasks);
router.post('/tasks', verifyToken, isAdminOrAssistant, createTask);
router.put('/tasks/:id', verifyToken, isStaff, updateTaskStatus);

// Assistant Notifications
router.get('/notifications', verifyToken, isStaff, getAssistantNotifications);
router.put('/notifications/read', verifyToken, isStaff, markAssistantNotificationsAsRead);

export default router;

