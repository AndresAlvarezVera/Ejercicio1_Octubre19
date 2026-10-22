import crypto from 'crypto';

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export default { hashPassword };