const express = require("express");
const mongoose = require('mongoose');
const { mongourl } = require("./config/config.js");
// env환경변수 라이브러리
// const dotenv =require("dotenv");
// 토큰검증 미들웨어
const app = express();
const Routers = require('./routes/routes.js');

// 환경변수 사용선언
// dotenv.config();
app.use(express.json());
const port = 30004;

mongoose.connect(`${mongourl}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

//  POST login요청이 들어오면 body에 id와 password를 실어서 요청으로 가정해서 jwt를발급해준다.
app.use('/api', Routers);

app.get('/test', (req, res) => {
    return res.json({ msg: "test" })
});

app.use((req, res, next) => {
    res.status(404).send('Not found')
})

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).send('internal server Error')
})
app.listen(port);