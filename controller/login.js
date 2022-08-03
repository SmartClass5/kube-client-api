const { User } = require('../models/user-permission');
const _ = require('lodash');
const useBcryto = require('../utils/bcrpyto');
const useJwt = require('../utils/jwt');

let LoginController ={}


 LoginController.form = async (req,res,next)=>{

    const {username, password} = req.body;
    let token = "";
    // 1. 유저아이디와 비밀번호를 확인
    try {
      const userInfo = await User.find({username})
      if(_.isEmpty(userInfo)){
        // 가입되지 않은 사용자
        return res.status(400).json({ msg:"로그인에 실패하였습니다" })
      }else if(!_.isEmpty(_.get(userInfo,'0.password'))){
        const comparepwd = useBcryto.compare(password,_.get(userInfo,'0.password'))
        if(comparepwd){
          token = useJwt.createToken(username,password)
          return res.status(200).json({ 
            code:200,
            token,
            msg:"로그인이 정상적으로 처리 되었습니다" })
        }else{
          return res.status(400).json({ 
            msg:"로그인에 실패하였습니다" })
        }
      }
    } catch (error) {
      console.log(error)
      throw new Error('로그인이 정상적으로 처리되지 않았습니다')
    }
}


module.exports = LoginController;