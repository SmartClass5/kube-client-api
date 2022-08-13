const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.NetworkingV1Api);

let k8sIngress = {};

/**
 * yaml 파일을 사용하여 ingress 생성 함수
 */
k8sIngress.createIngress = async (yaml) => {
    try {
        if (yaml == null || yaml == undefined) {
            throw new Error("Required parameter yaml was null or undefined when calling createIngress");
        }
        // yaml에 namespace 정보가 없을 경우 default 지정
        let namespace = yaml.metadata.namespace;
        if (!namespace) {
            namespace = 'default';
        }
        // ingress 생성
        const result = await k8sApi.createNamespacedIngress(namespace, yaml);

        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * ingress 제거 함수
 */
k8sIngress.deleteIngress = async (name, namespace) => {
    try {
        if (name == null || name == undefined) {
            throw new Error('Required parameter name was null or undefined when calling deleteIngress');
        }
        if (namespace == null || namespace == undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling deleteIngress');
        }
        
        // 요청된 이름에 해당하는 ingress를 namespace에서 제거
        const result = await k8sApi.deleteNamespacedIngress(name, namespace);

        return true;
    } catch (err) {
        throw err;
    }
}

module.exports = k8sIngress;