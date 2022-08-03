require('dotenv').config();

module.exports = {
    // 서버 정보
    bcryptLen:process.env.BCRYPTLEN,
    jwtscret: process.env.JWTSCRET,
    mongourl: process.env.MONGOURL
}