const bcryto = require('bcrypt');
const { bcryptLen } =require("../config/config")

let useBcryto = {};

/**
 * 
 * 해시 암호화
 * 
 */
useBcryto.hashed =(password) =>{
    return bcryto.hashSync(password,Number(bcryptLen));
}

/**
 * 
 * 암호화와 비교
 * 
 */
useBcryto.compare =(password,hashed) =>{
    console.log(password,hashed)
    return bcryto.compareSync(password,hashed);
}


module.exports = useBcryto;