const prisma = require('./prisma.js');

const incomeModel ={
    async createIncome({user_id, amount, category_id, account_id, description, currency}) {

        return prisma.income.create({
            data: {
                user_id,
                amount,
                category_id,
                account_id,
                description,
                currency: currency || "GHS"
            }
        });
    },

    async getUserIncome(user_id) {
        return prisma.income.findMany({
            where: { user_id: user_id },
            select:{
                income_id: true,
                amount: true,
                category_id: true,
                account_id: true,
                description: true,
                currency: true,
                received_at: true
            },
            orderBy: { received_at: "desc" }
        });
    },

    async updateIncome(income_id, user_id, updates) {
        // Verify ownership before updating
        const income = await prisma.income.findUnique({
            where: { income_id: parseInt(income_id) }
        });

        if (!income || income.user_id !== user_id) {
            return null;
        }

        return prisma.income.update({
            where: { income_id: parseInt(income_id) },
            data: updates
        });
    },

    async deleteIncome(income_id, user_id) {
        // Verify ownership before deleting
        const income = await prisma.income.findUnique({
            where: { income_id: parseInt(income_id) }
        });

        if (!income || income.user_id !== user_id) {
            return null;
        }

        return prisma.income.delete({
            where: { income_id: parseInt(income_id) }
        });
    }
}

module.exports = incomeModel;