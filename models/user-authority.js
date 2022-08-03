const mongoose = require('mongoose');
// 유저 권한 관련
const UserAuthoritySchemma = new mongoose.Schema({
    title: { type: String, required: true },
}, { timestamps: true })

const UserAuthority = mongoose.model('user-authority', UserAuthoritySchemma);
module.exports = { UserAuthority };