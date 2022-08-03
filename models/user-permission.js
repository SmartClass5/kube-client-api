const mongoose = require('mongoose');
const {Schema:{Types:{ObjectId}}} = mongoose;

// 유저 관련
const UserSchemma = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    authority: [{ type: ObjectId , ref: "user-authority" }],
}, { timestamps: true })

const User = mongoose.model('user-permission', UserSchemma);
module.exports = { User };