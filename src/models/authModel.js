const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');


const authModel={
    async signUp(userData){
        try{
            const{
                username,
                email,
                password
            }=userData;

            // Check if user exists
            const existingUser = await db.query(
                'SELECT user_id FROM users WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUser.rows.length > 0) {
                throw new Error('Username or email already exists');
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            const userResult = await db.query(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?) RETURNING user_id, username, email',
                [username, email, passwordHash]
            );

            const user = userResult.rows[0];

            return user;
        }catch(error){
            throw error;
        }
    },

    async signIn(credentials) {
        try {
            const { username, password } = credentials;

            // Find user
            const userResult = await db.query(
                'SELECT user_id, username, password_hash FROM users WHERE username = ?',
                [username]
            );

            if (userResult.rows.length === 0) {
                throw new Error('Invalid credentials');
            }

            const user = userResult.rows[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Invalid Password');
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    user_id: user.user_id, 
                    username: user.username 
                },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            return {
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                }
            };
        } catch (error) {
            throw error;
        }
    },
 
    async getProfile(userId) {
        try {
            const userResult = await db.query(
                'SELECT user_id, username, email FROM users WHERE user_id = ?',
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new Error('User not found');
            }

            return userResult.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async detailed_profile(userId) {
        try {
            const userResult = await db.query(
                //Implementing sub queries
                `
                SELECT 
                u.user_id,
                u.username,
                u.full_name,
                u.email,
                u.created_at,

                -- Total Budgets
                (
                    SELECT COUNT(*)
                    FROM budgets b
                    WHERE b.user_id = u.user_id
                ) AS total_budgets,

                -- Total Expenses
                (
                    SELECT COUNT(*)
                    FROM expenses e
                    WHERE e.user_id = u.user_id
                ) AS total_expenses,

                -- Total Money Spent
                (
                    SELECT COALESCE(SUM(e.amount),0)::float
                    FROM expenses e
                    WHERE e.user_id = u.user_id
                ) AS total_spent

                FROM users u
                WHERE u.user_id = $1;                 
                `,
                [userId]
            );

            return userResult.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async updateProfile(userId, updates) {
        const data = await db.query(
             `UPDATE users
              SET ${Object.keys(updates).map((k, i) => `${k}=$${i + 1}`).join(', ')}
              WHERE user_id=$${Object.keys(updates).length + 1}
              RETURNING user_id, username, email, full_name`,
             [...Object.values(updates), userId]
         );

         return data.rows[0];
    }
};

module.exports = authModel;
