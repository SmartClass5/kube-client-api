var log = {};

log.log = (type, message)  => {
    console.log(`[LOG] | ${new Date()} | ${type} | ${message}`);
}

log.error = (type, message) => {
    console.error(`[ERROR] | ${new Date()} | ${type} | ${message}`);
}

module.exports = log;