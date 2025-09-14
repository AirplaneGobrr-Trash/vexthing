// const { QuickDB, JSONDriver } = require("quick.db");
// const jsonDriver = new JSONDriver();
// const quickDB = new QuickDB({
//     driver: jsonDriver
// });

// TODO: Replace this with a real database lowkey

const { QuickDB } = require("quick.db");
const quickDB = new QuickDB();

module.exports = quickDB