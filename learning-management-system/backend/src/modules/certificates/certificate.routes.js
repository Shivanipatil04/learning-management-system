const express = require('express');
const router = express.Router();
const certificateController = require('./certificate.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

// Teacher routes
router.get('/eligible', protect, authorize('teacher'), certificateController.getEligibleStudents);
router.post('/issue', protect, authorize('teacher'), certificateController.issueCertificate);
router.get('/issued', protect, authorize('teacher'), certificateController.getIssuedCertificates);

// Student routes
router.get('/mine', protect, authorize('student'), certificateController.getMyCertificates);

module.exports = router;
