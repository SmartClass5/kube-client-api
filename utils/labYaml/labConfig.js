const _ = require('lodash');
const LabBase = require('./labBase');

const yamlConfig = require("../yaml/yamlConfig");

let labConfig = {};

/**
 * 실습실의 yaml 생성 함수
 */
createLabYaml = (config) => {
    const { name, namespace, image, version, cpu, memory, node, object, lab, targetPort, timer, university } = config;
    const labBase = new LabBase(name, namespace, lab, image, version, cpu, memory, timer, university);

    let env = undefined;
    let command = undefined;
    let args = undefined;
    let mntDir = undefined;
    let passDir = undefined;

    // 실습실의 생성 시 이미지별로 설정해야하는 옵션
    switch(lab) {
        case 'jupyter':
            // jupyter lab enable
            env = {
                "JUPYTER_ENABLE_LAB": "yes",
            };
            // jupyter start 스크립트
            command = [
                "start-notebook.sh"
            ];
            // jupyter start 스크립트 실행 시 옵션
            args = [
                "--ip='0.0.0.0'",
                "--no-browser",
                "--allow-root", // root 접속 허용
                "--NotebookApp.notebook_dir=/home/labuser/Desktop", // jupyter의 기본 디렉토리 위치 지정
                "--NotebookApp.allow_password_change=False",
                `--NotebookApp.token=\"${name}\"`,  // jupyter 접속 token 지정, pod 이름으로 지정
                "--NotebookApp.tornado_settings={'headers': {'Content-Security-Policy': \"frame-ancestors 'self' * \"}}"    // iframe cors 처리
            ];
            mntDir = '/home/labuser/Desktop/drive'; // object storage를 mount할 위치 지정
            passDir = '/home/labuser/Desktop';  // object storage mount 하기위한 password 정보 저장 위치
            break;
        case 'unity':
        case 'gephi':
        case 'orange3':
        case 'labview':
        case 'anaconda':
            // novnc 해상도 지정
            env = {
                "RESOLUTION": "1920x1080"
            };
            mntDir = '/home/labuser/Desktop/drive'; // object storage를 mount할 위치 지정
            passDir = '/home/labuser/Desktop';  // object storage mount 하기위한 password 정보 저장 위치
            break;
    }
    
    // env 설정 값이 있는 경우
    if(env != undefined) { labBase.setEnv(env); }
    // command 설정 값이 있는 경우
    if(command != undefined) { labBase.setCommand(command); }
    // args 설정 값이 있는 경우
    if(args != undefined) { labBase.setArgs(args); }
    // 접속 port 지정
    labBase.setPort(targetPort);
    // 배포할 node 지정
    labBase.setNode(node);
    // object mount 할 경우
    if(object != undefined && mntDir != undefined && passDir != undefined) { labBase.setMount(object, passDir, mntDir); }

    return labBase.getManifest();
}

/**
 * 실습실 생성하기 위한 yaml 정보 반환
 */
labConfig.make = (config) => {
    let labInfo = {};

    labInfo['lab'] = createLabYaml(config);
    labInfo['service'] = yamlConfig.make("service", config);
    labInfo['ingress'] = yamlConfig.make("ingress", config);
    return labInfo;
}

module.exports = labConfig;
