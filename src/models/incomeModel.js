const db = require('../config/db');
const prisma =require('./prisma.js');

const incomeModel ={
    async createIncome({user_id,amount, source, method, description}) {

        return prisma.income.create({
            data: {
                user_id,
                amount,
                source,
                method,
                description
            }
        });
    },

    async getUserIncome(user_id) {
        return prisma.income.findMany({
            where: { user_id: user_id },
            select:{source:true,amount:true,method:true},
            orderBy: { received_at: "desc" }
        });
    },

    async updateIncome (income_id, user_id, updates) {
  
        const keys = Object.keys(updates);      // ['amount','source']  
        const values = Object.values(updates);  // [100,'Cash']
        
        const setClause = keys
        .map((k, i) => `${k}=$${i + 1}`)
        .join(', '); // "amount=$1, category=$2"
        
        const query=
            `UPDATE income
            SET ${setClause}
            WHERE income_id=$${keys.length + 1} AND user_id=$${keys.length + 2}
            RETURNING *`
        ;

        const result = await db.query(query, [
            ...values,
            income_id,
            user_id]);
        return result.rows[0];
    },

    async deleteIncome (income_id , user_id) {
        const result = await db.query(
            'DELETE FROM income WHERE income_id=$1 AND user_id=$2 RETURNING *',
            [income_id, user_id]
        );

        return result.rows[0];
    }


}

module.exports = incomeModel;