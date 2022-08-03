const mongoose = require('mongoose');
const { User } = require('../models/user-permission');
const { UserAuthority } = require('../models/user-authority');
const {Schema:{Types:{ObjectId}}} = mongoose;
const _ = require('lodash');
const useBcryto = require('../utils/bcrpyto');
let UserController = {}

UserController.form = async (req, res, next) => {
    
    const {username, email, password,password_confirm,name, phone } = req.body;
     // 1. 비밀번호 일치 불일치 검사
     if(password != password_confirm ){
        return res.status(200).json({ msg:"비밀번호가 일치하지 않습니다." })
     }
    // 2. 비밀번호 유효성 검사
    // 최소 8자 이상,하나이상의 문자, 하나의 숫자 및 하나의 특수 문자 정규식
    const pwdpattern1 = new RegExp(/[0-9]/);
    const pwdpattern2 = new RegExp(/[a-zA-Z]/);
    const pwdpattern3 = new RegExp(/[!@~\#$%<>^&*]/); // 원하는 특수문자 추가 제거
    const regexphone  =  new RegExp(/\d{3}-\d{4}-\d{4}/);
    const regexemail  =  new RegExp(/^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i);
    if( !regexphone.test(phone) ) {
        return res.status(200).json({ msg:"전화번호는 000-0000-0000 형식으로 작성해 주세요" })
    }
    if( !regexemail.test(email) ) {
        return res.status(200).json({ msg:"이메일 형식이 아닙니다" })
    }
    if( !pwdpattern1.test(password) || !pwdpattern2.test(password) || !pwdpattern3.test(password)  ) {
        res.status(201).json({ msg:"영문 + 숫자+ 특수기호 8자리 이상으로 구성하여야 합니다" })
    }
    // 3. 이미 있는 사용자인지 아닌지 확인
    // username, email 사용중인 아이디 인지, 가입된 이메일인지 확인해야함

        const search_username = await User.find({username})
        if(!_.isEmpty(search_username)){
           return res.status(200).json({ msg:"이미 사용중인 아이디 입니다" })
        }
        const search_email = await User.find({email})
        if(!_.isEmpty(search_email)){
           return res.status(200).json({ msg:"가입된 이메일 입니다" })
        }

   
    // 4. default 값으로 수강생 권한으로 넣어줌
    let stu_authrity;
    try {
        const authority = await UserAuthority.find({title:"수강생"});
        stu_authrity= _.get(authority,'0._id');
    } catch (error) {
        throw new Error('사용자 권한 검색 에러')
    }
    // 5. 비밀번호 암호화 하여 저장
    const hashedpwd = useBcryto.hashed(password)

    try {
        const result = await User.updateOne({ username,
            email},{
            username,
            email,
            password:hashedpwd,
            name,
            phone,
            authority:stu_authrity
        },{upsert:true})
    
        return res.status(200).json({ msg:"회원가입이 정상적으로 처리 되었습니다" })
    } catch (error) {
        throw new Error('회원 가입이 정상적으로 처리되지 않았습니다')
    }

    

}
module.exports = UserController;