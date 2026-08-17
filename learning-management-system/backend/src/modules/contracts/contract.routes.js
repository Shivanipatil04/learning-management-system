const express = require("express");
const router = express.Router();
const contractController = require("./contract.controller");
const protect = require("../auth/auth.middleware");

router.use(protect);

router.post("/", contractController.createContract);
router.get("/all", contractController.getAllContracts);
router.get("/my", contractController.getMyContract);
router.get("/:id", contractController.getContractById);
router.put("/:id", contractController.updateContract);
router.patch("/:id/status", contractController.changeStatus);

module.exports = router;
