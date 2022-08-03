const { jwtscret } =require("../config/config")
 // jwt 라이브러리
 const jwt =require("jsonwebtoken"); 

let useJwt = {};

// 암호화 하여 저장하는 로직
useJwt.createToken =(username, password) =>{
    const key = jwtscret;
    return jwt.sign(
        {
          type: "JWT",
          username: username,
          password: password,
        },
        key,
        {
          expiresIn: "1d", // 15분후 만료
          issuer: "토큰발급자",
        }
      );
}

module.exports = useJwt;