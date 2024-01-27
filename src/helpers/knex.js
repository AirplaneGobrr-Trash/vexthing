/**
 * @type {import("knex").Knex}
 */
let knex = global.g_knex

if (!knex) {
    knex = require("knex")({
        client: 'sqlite3', // or 'better-sqlite3'
        useNullAsDefault: true,
        connection: {
            filename: "./data.sqlite",
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        }
    });
    global.g_knex = knex
}

module.exports = knex