const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const convertPlaceholders = (text = '') => {
    let index = 0;
    return text.replace(/\?/g, () => {
        index += 1;
        return `$${index}`;
    });
};

const query = (text, params = []) => {
    const hasQuestionMarks = typeof text === 'string' && text.includes('?');
    const hasPgParams = typeof text === 'string' && /\$\d+/.test(text);
    const finalText = hasQuestionMarks && !hasPgParams ? convertPlaceholders(text) : text;
    return pool.query(finalText, params);
};

const end = () => pool.end();

const db = {
    query,
    end,
    pool
};

/*const pool=new Pool({
    username:process.env.DB_USERNAME,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
})*/

module.exports = db;