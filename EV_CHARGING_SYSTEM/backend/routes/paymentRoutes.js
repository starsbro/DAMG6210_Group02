const express = require('express');
const router = express.Router();
const {
  completePayment,
  getUserPaymentMethods,
  getUserInvoices
} = require('../controllers/paymentController');

// POST /api/payments/complete - Complete a payment
router.post('/complete', completePayment);

// GET /api/payments/user/:userId/methods - Get user payment methods
router.get('/user/:userId/methods', getUserPaymentMethods);

// GET /api/payments/user/:userId/invoices - Get user invoices
router.get('/user/:userId/invoices', getUserInvoices);

module.exports = router;
