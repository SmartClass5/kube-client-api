const k8s = require('@kubernetes/client-node');
const config = require('../../config/config');
const fs = require('fs');
const randomstring = require("randomstring");

// kubernetes 접속을 위한 config 파일 load
const kc = new k8s.KubeConfig({
    clusters: [config.cluster],
    users: [config.user],
    contexts: [config.context],
    currentContext: config.context.name,
});
kc.loadFromDefault();

let k8sApi = {};

// object 별로 사용할 kuberentes api 정의
const k8sApiVersion = {
    "pod": k8s.CoreV1Api,
    "deployment": k8s.AppsV1Api,
    "service": k8s.CoreV1Api,
    "obeject": k8s.CustomObjectsApi,
    "node": k8s.CoreV1Api,
    "namespace": k8s.CoreV1Api
}

/**
 * 요청 object에 맞는 api 반환
 */
k8sApi.makeApi = (kind) => {
    if (!(Object.keys(k8sApiVersion).includes(kind))) {
        throw new Error('Find Not kind');
    }
    const version = k8sApiVersion[kind]
    const k8sApi = kc.makeApiClient(version);
    return k8sApi;
}

// file을 yaml로 변환하여 반환
k8sApi.loadYamlFile = async (yamlPath) => {
    try {
        return k8s.loadYaml(fs.readFileSync(yamlPath, 'utf8'));
    } catch (err) {
        throw err;
    }
}

// string을 yaml로 변환하여 반환
k8sApi.loadYaml = async (yamlStr) => {
    try {
        return k8s.loadYaml(yamlStr);
    } catch (err) {
        throw err;
    }
}

/**
 * cpu, memory의 문자를 숫자로 변환
 */
k8sApi.convertUnit = (x, type) => {
    let n = parseInt(x, 10) || 0;
    if (type == 'memory') { // 결과 단위 : Mi
        let units = ['bytes', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei'];
        let unit = typeof x === 'string' && x.replace(n, '') || '';
        let l = units.indexOf(unit);
        if (l !== -1) {
            let result = Math.pow(1024, l) * n / (1024 * 1024);
            return result;
        }
    } else if (type == 'cpu') {
        let units = ['m'];
        let unit = typeof x === 'string' && x.replace(n, '') || '';
        let l = units.indexOf(unit);
        if (l !== -1) {
            let result = n / 1000;
            return result;
        }
    }
    return n;
}

/**
 * 이메일의 특수문자를 언더바(_)로 변환
 * 서비스 서버 별로 namespace를 구분하기 위해 university를 변환된 이메일과 연결하여 
 * namespace 이름 반환
 */
k8sApi.convertEmail = (id, university) => {
    let userId = id;
    regExp = /[@|.]/g;
    userId = userId.replace(regExp, '-');

    return `${university}-` + userId;
}

/**
 * 실습실 생성 시 사용할 pod의 랜덤 이름 생성
 *
 */
k8sApi.convertEmailtoName = () => {
    // 길이 20인 랜덤인 영어 이름 생성
    const randStr = randomstring.generate({
        charset: 'qwertyuiopasdfghjklzxcvbnm',
        length: 20
    });
    return randStr;
}

module.exports = k8sApi;