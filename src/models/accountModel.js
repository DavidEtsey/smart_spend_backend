const prisma = require('./prisma.js');

const getAccounts =async (user_id,type) => {
    const accounts = await prisma.account.findMany({
       where:{
            OR: [
                { user_id: null }, // System accounts
                { user_id: user_id } // User's custom accounts
            ]
        },
        select: {
            account_id: true,
            name: true,
            icon: true,
            color: true,
        }
    });

    return accounts;
}

const customizeAccount = async (user_id, type,name) => {
    const newAccount = await prisma.account.create({
        data: {
            user_id,
            type,
            name
        }
    });
    return newAccount;
}

module.exports = { customizeAccount,getAccounts };