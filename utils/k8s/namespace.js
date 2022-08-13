const k8sClient = require('./client');

const k8sApi = k8sClient.makeApi('namespace');

k8sNamespace = {};

/**
 * namespace 리스트 반환 함수
 */
k8sNamespace.listNamespace = async () => {
    // namespace 리스트 확인
    const res = await k8sApi.listNamespace();
    let result = [];
    res.body.items.forEach((item) => {
        // namespace 정보들중 이름만 추출
        result.push(item.metadata.name);
    });

    return result;
}

/**
 * yaml를 이용하여 namespace 생성 함수
 */
k8sNamespace.createNamespace = async (yaml) => {
    try {
        if (yaml == null || yaml == undefined) {
            throw new Error("Required parameter yaml was null or undefined when calling createDeployment");
        }

        const result = await k8sApi.createNamespace(yaml);
        return true;
    } catch (err) {
        throw err;
    }
}

module.exports = k8sNamespace;