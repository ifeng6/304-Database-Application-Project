const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

var fs = require('fs');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}
// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

// ----------------------------------------------------------
// Script that drops all tables, creates all tables, and 
// inserts values into all tables

async function resetAndPopulateTables() {
    var sql = fs.readFileSync('setUp.sql').toString().split(";\n");
    return await withOracleDB(async (connection) => {
        for (let i = 0; i < sql.length - 1; i++) {
            try {
                await connection.execute(sql[i], [], { autoCommit: true });
            } catch(err) {
                console.log(sql[i]);
                console.log('Error', err.message);
            }
        }
        console.log('Initiation success')
        return true;
    }).catch(() => {
        return false;
    });
}

// table fetches

async function fetchFromDb(table) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM ${table}`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// ----------------------------------------------------------
// 11 queries

async function insertionQuery(username, mID, date_created, rating, title, comments) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            INSERT INTO Reviews (username, mID, date_created, rating, title, comments) 
            VALUES (:username, :mID, TO_DATE(:date_created, 'YYYY-MM-DD'), :rating, :title, :comments)
            `,
            [username, mID, date_created, rating, title, comments],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deletionQuery(name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
        DELETE FROM Community
        WHERE name=:name
        `,
            [name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateQuery(username, gender, age, email) {
    return await withOracleDB(async (connection) => {
        let query = `UPDATE Users SET`;
        const conditions = [];
        const queryVars = {};
        if (username) {
            queryVars.username = username;
        }
        if (gender) {
            queryVars.gender = gender;
            conditions.push(` gender=:gender`);
        }
        if (age) {
            queryVars.age = age;
            conditions.push(` age=:age`);
        }
        if (email) {
            queryVars.email = email;
            conditions.push(` email=:email`);
        }
        query += conditions.join(',');
        query += ` WHERE username=:username`;
        const result = await connection.execute(query, queryVars, { autoCommit: true });
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function joinQuery(title) {
    return await withOracleDB(async (connection) => {
        const data = await connection.execute(`
            SELECT r.username, r.rating, r.title, r.comments, r.date_created
            FROM Media m, Reviews r
            WHERE m.mID = r.mID AND m.title = :title
        `,
            [title],
            { autoCommit: true });
        return { data: data.rows, success: true };
    }).catch(() => {
        return { data: [], success: false };
    });
}

async function groupByQuery() {
    return await withOracleDB(async (connection) => {
        const data = await connection.execute(`
            SELECT r.username, COUNT(*)
            FROM Reviews r
            GROUP BY r.username
        `,
            [],
            { autoCommit: true });
        return { data: data.rows, success: true };
    }).catch(() => {
        return { data: [], success: false };
    });
}

async function havingQuery() {
    return await withOracleDB(async (connection) => {
        const data = await connection.execute(`
            SELECT c.FirstName, c.LastName, COUNT(*)
            FROM CrewMember c, HasFavourite f
            WHERE c.cID = f.cID
            GROUP BY c.cID, c.FirstName, c.LastName
            HAVING COUNT(*) > 1
        `,
            [],
            { autoCommit: true });
        return { data: data.rows, success: true };
    }).catch(() => {
        return { data: [], success: false };
    });
}

async function nestedQuery() {
    return await withOracleDB(async (connection) => {
        const data = await connection.execute(`
            SELECT *
            FROM (SELECT m.mID, m.title, AVG(r.rating) as avgrating
                    FROM Media m, Reviews r
                    WHERE m.mID = r.mID
                    GROUP BY m.mID, m.title
                    HAVING COUNT(*) > 1)
            WHERE avgrating = 
                (SELECT MAX(avgrating)
                    FROM (SELECT m.mID, m.title, AVG(r.rating) as avgrating
                            FROM Media m, Reviews r
                            WHERE m.mID = r.mID
                            GROUP BY m.mID, m.title
                            HAVING COUNT(*) > 1))
        `,
            [],
            { autoCommit: true });
        return { data: data.rows, success: true };
    }).catch(() => {
        return { data: [], success: false };
    });
}

async function divisionQuery(genre) {
    return await withOracleDB(async (connection) => {
        const data = await connection.execute(`
            SELECT u.username
            FROM Users u
            WHERE NOT EXISTS (
                SELECT m.mID
                FROM Media m
                WHERE m.genre=:genre AND
                    NOT EXISTS (
                        SELECT r.mID 
                        FROM Reviews r
                        WHERE r.mID = m.mID AND r.username = u.username))
        `,
            [genre],
            { autoCommit: true });
        return { data: data.rows, success: true };
    }).catch(() => {
        return { data: [], success: false };
    });
}

async function projectionQuery(username, gender, age, email, date_joined) {
    if (!(username || gender || age || email || date_joined)) {
        return { data:[], success: true };
    }
    return await withOracleDB(async (connection) => {
        let query = `SELECT`;
        const conditions = [];
        const queryVars = {};
        if (username) {
            conditions.push(` username`);
        }
        if (gender) {
            conditions.push(` gender`);
        }
        if (age) {
            conditions.push(` age`);
        }
        if (email) {
            conditions.push(` email`);
        }
        if (date_joined) {
            conditions.push(` date_joined`);
        }
        query += conditions.join(',');
        query += ` FROM Users`;
        try {
            const result = await connection.execute(query, queryVars, { autoCommit: true });
            console.log("username", username, "email", email, "age", age, "gender", gender, "date", date_joined);
            return { data:result.rows, success: true };
        } catch(err) {
            console.log('Error', err.message);
        }
    }).catch(() => {
        return { data:[], success: false };
    });
}

async function selectionQuery(text) {
    const validAttributes = ['mID', 'title', 'genre', 'date_released']
    if (text.toString().includes(';')) {
        return { data:[], success: false }; 
    }
    return await withOracleDB(async (connection) => {
        const query = `SELECT * FROM Media m WHERE ` + text;
        try {
            const result = await connection.execute(query, [], { autoCommit: true });
            return { data:result.rows, success: true };
        } catch(err) {
            return { data:[], success: false };
        }
    }).catch(() => {
        return { data:[], success: true };
    });
}

module.exports = {
    testOracleConnection,
    resetAndPopulateTables,
    fetchFromDb,
    insertionQuery,
    deletionQuery,
    updateQuery,
    joinQuery,
    groupByQuery,
    havingQuery,
    nestedQuery,
    divisionQuery,
    projectionQuery,
    selectionQuery
};
