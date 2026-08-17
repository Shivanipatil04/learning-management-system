const cron = require('node-cron');
const Contract = require('../modules/contracts/contract.model');
const Notification = require('../modules/notifications/notification.model');

const checkContractExpiries = async () => {
  try {
    const activeContracts = await Contract.find({ status: { $in: ['Active', 'Accepted'] } }).populate('teacherId classAdminId');
    const now = new Date();

    for (const contract of activeContracts) {
      if (!contract.teacherId || !contract.classAdminId) continue;

      const msDiff = contract.endDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

      let alertType = null;
      let teacherMsg = '';
      let adminMsg = '';

      if (daysDiff <= 0) {
        alertType = 'CONTRACT_EXPIRED';
        contract.status = 'Expired';
        await contract.save();

        const msg = "The teaching contract has expired. Teaching content management access has been disabled until a new contract becomes active.";
        teacherMsg = msg;
        adminMsg = msg;
      } else if (daysDiff <= 1) {
        alertType = 'CONTRACT_EXPIRING_1_DAY';
        teacherMsg = `Your teaching contract will expire on ${contract.endDate.toLocaleDateString()}. Please contact your Class Admin regarding renewal.`;
        adminMsg = `${contract.teacherId.name}'s teaching contract will expire on ${contract.endDate.toLocaleDateString()}.`;
      } else if (daysDiff <= 7) {
        alertType = 'CONTRACT_EXPIRING_7_DAYS';
        teacherMsg = `Your teaching contract will expire on ${contract.endDate.toLocaleDateString()}. Please contact your Class Admin regarding renewal.`;
        adminMsg = `${contract.teacherId.name}'s teaching contract will expire on ${contract.endDate.toLocaleDateString()}.`;
      } else if (daysDiff <= 30) {
        alertType = 'CONTRACT_EXPIRING_30_DAYS';
        teacherMsg = `Your teaching contract will expire on ${contract.endDate.toLocaleDateString()}. Please contact your Class Admin regarding renewal.`;
        adminMsg = `${contract.teacherId.name}'s teaching contract will expire on ${contract.endDate.toLocaleDateString()}.`;
      }

      if (alertType) {
        // Ensure we haven't already sent this specific alert for this contract
        const existingAlert = await Notification.findOne({
          contractId: contract._id,
          type: alertType
        });

        if (!existingAlert) {
          // Send to Teacher
          await Notification.create({
            recipientId: contract.teacherId._id,
            recipientRole: 'teacher',
            contractId: contract._id,
            type: alertType,
            title: alertType === 'CONTRACT_EXPIRED' ? 'Contract Expired' : 'Contract Expiring Soon',
            message: teacherMsg
          });

          // Send to Admin
          await Notification.create({
            recipientId: contract.classAdminId._id,
            recipientRole: 'coachingClassAdmin',
            contractId: contract._id,
            type: alertType,
            title: alertType === 'CONTRACT_EXPIRED' ? 'Teacher Contract Expired' : 'Teacher Contract Expiring Soon',
            message: adminMsg
          });
        }
      }
    }
  } catch (error) {
    console.error('Error running contract expiry job:', error);
  }
};

const initCronJobs = () => {
  // Run once immediately (useful for dev) and then once a day at midnight
  checkContractExpiries();
  cron.schedule('0 0 * * *', checkContractExpiries);
  console.log("Cron jobs initialized");
};

module.exports = initCronJobs;
