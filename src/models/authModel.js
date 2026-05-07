const bcrypt = require('bcrypt');
const { sendEmail } =require('../utils/sendEmail.js');
const generateToken = require('../utils/generateToken.js')

const prisma = require('./prisma.js');

const authModel = {

    async signUp(userData) {
        const { username, full_name, email, password } = userData;

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            throw new Error('Username or email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password_hash: passwordHash,
                full_name,
            },
            select: {
                user_id: true,
                username: true,
                email: true
            }
        });

        return user;
    },

    async signIn(credentials) {
        const { identifier, password } = credentials;

        //console.log(Object.keys(prisma));

        const user = await prisma.user.findFirst({
            where: {
            OR: [
                { username: identifier },
                { email: identifier }
            ]
            },
            select:{
                user_id: true,
                username: true,
                password_hash: true
            }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            throw new Error('Invalid Password');
        }

        const token = generateToken({
            user_id: user.user_id,
        });

        return {
            token,
            user: {
                user_id: user.user_id,
                username: user.username
            }
        };
    },

    async getProfile(userId) {

        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                user_id: true,
                username: true,
                email: true
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    },

    async detailed_profile(userId) {

        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                budgets: true,
                expenses: true,
                income:true
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const total_budgets = user.budgets.length;
        const total_expenses = user.expenses.length;
        const total_income = user.income.length;
        const total_spent = user.expenses.reduce(
            (sum, expense) => sum + Number(expense.amount),
            0
        );

        return {
            user_id: user.user_id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            created_at: user.created_at,
            total_budgets,
            total_expenses,
            total_income,
            total_spent
        };
    },

    async updateProfile(userId, updates) {

        const user = await prisma.user.update({
            where: { user_id: userId },
            data: updates,
            select: {
                user_id: true,
                username: true,
                email: true,
                full_name: true
            }
        });

        return user;
    },

    async changePassword(password,newPassword,user_id) {
        // 1. Get user
        const user = await prisma.user.findUnique({ 
            where: { user_id: user_id }, 
            select:{password_hash: true }
        });
        if (!user) throw new Error("User not found");

        // 2. Check current password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) throw new Error("Current password is incorrect");

        // 3. Hash new password
        const newHash = await bcrypt.hash(newPassword, 10);

        // 4. Update password
        await prisma.user.update({
            where: { user_id: user_id },
            data: { password_hash: newHash },
        });

        return { message: "Password changed successfully" };
    },

    async forgotPassword(email) {

        // 1. Find user by email
        const user = await prisma.user.findUnique({ 
            where: { email: email }, 
        });
        
        // Always return same message (security)
        if (!user) {
            return { message: "If that email exists, a reset code has been sent." };
        }

        // Generate code (6 digits)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Expiry (10 minutes)
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: {
                reset_code: resetToken,
                reset_code_expires: expiry,
            },
        });

        // Send email
        await sendEmail(
        email,
        "Password Reset Code",
        `Your password reset code is: ${resetToken}\n\nThis code expires in 10 minutes.`
        );
        
    },

    async resetPassword(email, reset_code, new_password) {

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.reset_code || !user.reset_code_expires) {
        return { message: "Invalid or expired code" };
        }

        // Check token match
        if (user.reset_code !== reset_code) {
            return { message: "Invalid code" };
        }

        // Check expiry
        if (new Date() > user.reset_code_expires) {
            return { message: "Code expired" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        await prisma.user.update({
            where: { email },
            data: {
                password_hash: hashedPassword,
                reset_code: null,
                reset_code_expires: null,
            },
        });

    }
};

module.exports = authModel;