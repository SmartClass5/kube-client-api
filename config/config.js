require('dotenv').config();

module.exports = {
    // 서버 정보
    bcryptLen: process.env.BCRYPTLEN,
    jwtscret: process.env.JWTSCRET,
    mongourl: process.env.MONGOURL,
    cluster: {
        name: process.env.CLUSTERNAME,
        server: process.env.CLUSTERSERVER,
    },
    user: {
        name: process.env.USERNAME,
        password: process.env.USERPASSWORD,
    },
    context: {
        name: process.env.CONTEXTNAME,
        user: process.env.USERNAME,
        cluster: process.env.CLUSTERNAME,
    }
}