const k8sApi = require('./client');
const _ = require('lodash');
const { imageRepository: { harborAuth }} = require("../../config/config");

const coreV1Api = k8sApi.makeApi('pod');

let k8sSecret = {};

/**
 * namespace가 가지고 있는 secret 정보 반화 함수
 */
k8sSecret.getSecretInfo = async (name, namespace) => {
    try {
        if (name == null || name == undefined) {
            throw new Error('Required parameter name was null or undefined when calling getSecretInfo');
        }
        if (namespace == null || namespace == undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling getSecretInfo');
        }

        const res = await coreV1Api.readNamespacedSecret(name, namespace);

        return res.body;
    } catch(err) {
        throw err;
    }
}

/**
 * secret 생성 함수
 */
k8sSecret.createSecrets = async (yaml) => {
    try {
        if (yaml == null || yaml == undefined) {
            throw new Error("Required parameter yamlPath was null or undefined when calling createSecrets");
        }
        // yaml에 namespace가 별도로 지정 없을 경우 default로 지정
        let namespace = yaml.metadata.namespace;
        if (!namespace) {
            namespace = 'default';
        }
        const result = await coreV1Api.createNamespacedSecret(namespace, yaml)
        return result;
    } catch (err) {
        throw err;
    }
}

/**
 * docker private registry 접속 하기 위한 dockerconfig secret 생성 함수
 */
k8sSecret.createRegcred = async (namespace) => {
    try {
        let yaml = {
            "apiVersion": "v1",
            "kind": "Secret",
            "metadata": {
                "name": "harbor-regcred",
                "namespace": namespace
            },
            "data": {
                ".dockerconfigjson": harborAuth
            },
            "type": "kubernetes.io/dockerconfigjson"
        }
        const result = await coreV1Api.createNamespacedSecret(namespace, yaml)
        return result;
    } catch (err) {
        throw err;
    }
}

module.exports = k8sSecret;