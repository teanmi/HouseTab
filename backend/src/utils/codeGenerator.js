//generates and validates join codes for houses
function generateJoinCode(length = 6) {
    const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * CHARSET.length);
        code += CHARSET[randomIndex];
    }

    return code;
}

// normalizes a join code by removing spaces and converting to uppercase
function normalizeJoinCode(code) {
    if (!code || typeof code !== 'string') {
        return null;
    }
    // remove spaces, make them to uppercase
    const normalized = code.replace(/\s+/g, '').toUpperCase();
    // check if exactly 6 alphanumeric characters
    if (/^[A-Z0-9]{6}$/.test(normalized)) {
        return normalized;
    }
    return null;
}

//chech if the code is valid
function isValidJoinCode(code) {
    return normalizeJoinCode(code) !== null;
}

module.exports = {
    generateJoinCode,
    isValidJoinCode,
    normalizeJoinCode,
};
