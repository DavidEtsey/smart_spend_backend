require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const db = require('../src/config/db.js');
const {
    //extensionQuery,
    userTable,
    expenseTable,
    budgetTable,
    incomeTable
} = require('../src/config/schema.sql');

async function createTables() {
    try{
        console.log('Creating comprehensive SmartSpend database tables...');

        /*
        await db.query(extensionQuery);
        console.log('✓ pgcrypto extension ensured');
        */
        
        await db.query(userTable);
        console.log('✓ Users table created successfully');

        await db.query(expenseTable);
        console.log('✓ Expenses table created successfully');

        await db.query(budgetTable);
        console.log('✓ Budget table created successfully');

        await db.query(incomeTable);
        console.log('✓ Income table created successfully');

        await db.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE
        `);
        console.log('  ↳ Email column ensured on users table');

        await db.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS full_name TEXT
        `);
        console.log('  ↳ Full name column ensured on users table');

        /*await db.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
        `);
        console.log('  ↳ Email index ensured on users table');*/
    }catch (err) {
        console.error('❌ Error creating tables:', err.message);
        throw err;
    }
}

module.exports = {
    createTables
};

if (require.main === module) {
    createTables()
        .then(() => {
            console.log('\n✅ Table creation completed successfully.');
        })
        .catch((error) => {
            console.error('\n❌ Table creation failed:', error.message);
        })
        .finally(() => {
            db.end().catch((endErr) => {
                console.error('Error closing database pool:', endErr.message);
            });
        });
}
