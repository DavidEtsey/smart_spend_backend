const {createTransfer} = require('../models/transferModel.js');
const AppError = require('../utils/AppError.js');

const transferController = {
    async createTransfer(req, res, next) {
        try{
            const { from_account_id, to_account_id, amount, description } = req.body;
            const {user_id}=req.user;

            // Validate required fields
            if (!amount || !from_account_id || !to_account_id || !description) {
                throw new AppError("Amount, from_account_id, to_account_id, and description are required", 400);
            }

            // Amount must be a number and positive
            if (isNaN(amount) || Number(amount) <= 0) {
                throw new AppError("Amount must be a positive number", 400);
            }

            // Amount should not be unreasonably large
            if (Number(amount) > 100000000) {
                throw new AppError("Amount too large", 400);
            }

            // Validate IDs are positive integers
            if (!Number.isInteger(parseInt(from_account_id)) || parseInt(from_account_id) <= 0) {
                throw new AppError("Invalid from_account_id", 400);
            }

            if (!Number.isInteger(parseInt(to_account_id)) || parseInt(to_account_id) <= 0) {
                throw new AppError("Invalid to_account_id", 400);
            }

            const transfer = await createTransfer( user_id,from_account_id, to_account_id, amount, description);
            res.status(201).json(transfer);
        }catch(error){
            next(error);
        }
    }
}

module.exports = transferController;