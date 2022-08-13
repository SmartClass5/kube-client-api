const k8sApi = require('./client');

const serviceApi = k8sApi.makeApi('service');

let k8sService = {};

/**
 * namespace의 service 리스트를 반환
 */
k8sService.listService = async (namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling listService");
    }

    let result = [];
    const res = await serviceApi.listNamespaceService(namespace);
    res.body.items.forEach((item) => {
        result.push(item.metadata.name);
    });

    return result;
}

/**
 * service 생성
 */
k8sService.createService = async (yaml) => {
    try {
        if (yaml == null || yaml == undefined) {
            throw new Error("Required parameter yaml was null or undefined when calling createService");
        }
        // yaml에 namespace가 별도로 지정 없을 경우 default로 지정
        let namespace = yaml.metadata.namespace;
        if (!namespace) {
            namespace = 'default';
        }
        const result = await serviceApi.createNamespacedService(namespace, yaml);

        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * service 삭제
 */
k8sService.deleteService = async (serviceName, namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling deleteService");
    }
    if (serviceName == null || serviceName == undefined) {
        throw new Error("Required parameter serviceName was null or undefined when calling deleteService");
    }
    const result = await serviceApi.deleteNamespacedService(serviceName, namespace);
    return result;
}

module.exports = k8sService;