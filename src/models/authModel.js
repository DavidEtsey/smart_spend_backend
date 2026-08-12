const bcrypt = require('bcrypt');
const { sendEmail } =require('../services/sendEmail.js');
const generateToken = require('../utils/generateToken.js')
const crypto = require('crypto');
const AppError = require('../utils/AppError.js');

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
            throw new AppError('Username or email already exists', 409);
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

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { email: identifier }
                ]
            },
            select: {
                user_id: true,
                username: true,
                password_hash: true
            }
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            throw new AppError('Invalid Password', 401);
        }

        const accessToken = generateToken({
            user_id: user.user_id,
        });

        // Create refresh token and store its hash
        const refreshToken = crypto.randomBytes(48).toString('hex');
        const tokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.refreshToken.create({
            data: {
                user_id: user.user_id,
                tokenHash,
                expiresAt,
            }
        });

        return {
            token: accessToken,
            refreshToken,
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
            throw new AppError('User not found', 404);
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
            throw new AppError('User not found', 404);
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

    async createNewPassword(newPassword, user_id) {
        // 1. Get user
        const user = await prisma.user.findUnique({ 
            where: { user_id: user_id }, 
        });
        if (!user) throw new AppError("User not found", 404);

        // Hash new password
        const newHash = await bcrypt.hash(newPassword, 10);

        // Update password s
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

        // Generate token (6 digits)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Expiry (10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const tokenHash = await bcrypt.hash(resetToken, 10);

        await prisma.passwordReset.create({
            data: {
                user_id: user.user_id,
                tokenHash,
                expiresAt,
            }
        });

        // Send email
        await sendEmail(
        email,
        "Password Reset Code",
        resetToken
        );
        
    },

    async resetPassword(email, reset_code, new_password) {

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError("Invalid or expired code", 400);
        }

        // Find valid password reset record
        const passwordReset = await prisma.passwordReset.findFirst({
            where: {
                user_id: user.user_id,
                expiresAt: {
                    gt: new Date(), // Must not be expired
                },
                usedAt: null, // Must not have been used
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!passwordReset) {
            throw new AppError("Invalid or expired code", 400);
        }

        // Check token match
        const isValidToken = await bcrypt.compare(reset_code, passwordReset.tokenHash);
        if (!isValidToken) {
            throw new AppError("Invalid code", 400);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password and mark token as used
        await Promise.all([
            prisma.user.update({
                where: { email },
                data: { password_hash: hashedPassword },
            }),
            prisma.passwordReset.update({
                where: { id: passwordReset.id },
                data: { usedAt: new Date() },
            })
        ]);

    }

    ,
    async refreshToken(presentedToken) {
        if (!presentedToken) throw new AppError('No refresh token provided', 400);

        // Find active refresh tokens (not revoked, not expired)
        const tokens = await prisma.refreshToken.findMany({
            where: {
                revokedAt: null,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        let match = null;
        for (const t of tokens) {
            const ok = await bcrypt.compare(presentedToken, t.tokenHash);
            if (ok) {
                match = t;
                break;
            }
        }

        if (!match) throw new AppError('Invalid or expired refresh token', 401);

        // Issue new access token
        const accessToken = generateToken({ user_id: match.user_id });

        // Token rotation: mark old token as used, revoke all other tokens, create new one
        const newRefreshToken = crypto.randomBytes(48).toString('hex');
        const newHash = await bcrypt.hash(newRefreshToken, 10);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.$transaction([
            // Mark used token with usedAt timestamp
            prisma.refreshToken.update({
                where: { id: match.id },
                data: { usedAt: new Date() }
            }),
            // Revoke all other active tokens for this user (security: only one active token at a time)
            prisma.refreshToken.updateMany({
                where: {
                    user_id: match.user_id,
                    id: { not: match.id },
                    revokedAt: null
                },
                data: { revokedAt: new Date() }
            }),
            // Create new token for next refresh
            prisma.refreshToken.create({
                data: {
                    user_id: match.user_id,
                    tokenHash: newHash,
                    expiresAt: newExpiresAt
                }
            })
        ]);

        return { token: accessToken, refreshToken: newRefreshToken };
    }
};

module.exports = authModel;