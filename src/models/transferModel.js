const prisma = require('./prisma.js');

const createTransfer = async (from_account_id, to_account_id, amount, description) => {
  const transferData = await prisma.transfer.create({
    data: {
      from_account_id,
      to_account_id,
      amount,
      description,
    }
  });
  return { ...transferData};
};
module.exports = createTransfer;