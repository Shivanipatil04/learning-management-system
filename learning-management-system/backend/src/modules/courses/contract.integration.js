// Contract ownership stays in modules/contracts. This adapter is the only contract
// interface Courses depends on, so the Contracts implementation can evolve safely.
const contractService = require("../contracts/contract.service");

const getActiveTeacherContract = async (teacherId, at = new Date()) => {
  if (typeof contractService.getActiveContractForTeacher !== "function") return null;
  const contract = await contractService.getActiveContractForTeacher(teacherId, at);
  if (!contract) return null;
  const startsAt = contract.startsAt || contract.startDate;
  const endsAt = contract.endsAt || contract.endDate;
  if (contract.status && !["ACTIVE", "active"].includes(contract.status)) return null;
  if (startsAt && new Date(startsAt) > at) return null;
  if (endsAt && new Date(endsAt) < at) return null;
  return contract;
};

const getContractTenantId = (contract) => contract?.coachingClassId || contract?.tenantId || contract?.coachingClass;

// Temporary development mode. This hook remains isolated until Contracts is ready.
const contractEnforcementEnabled = () => false;

module.exports = { getActiveTeacherContract, getContractTenantId, contractEnforcementEnabled };
