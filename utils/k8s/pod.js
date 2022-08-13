const k8sApi = require('./client');
const _ = require('lodash');

const coreV1Api = k8sApi.makeApi('pod');

let k8sPod = {};

/**
 * namespace에 해당하는 pod들의 이름 반환 함수
 */
k8sPod.listPodNames = async (namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling listPod");
    }

    let result = [];

    // namespace에 해당하는 pod 정보 확인
    const res = await coreV1Api.listNamespacedPod(namespace);
    res.body.items.forEach((item) => {
        //result.push(item.metadata.name);
        // pod 정보에서 pod 이름만 추출
        result.push(item.spec.containers[0].name);
    });

    return result;
}

/**
 * namespace에 pod들의 정보 반환 함수
 */
k8sPod.listPods = async (namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling listPod");
    }

    let result = [];
    // namepsace에 해당하는 pod들의 정보 확인
    const res = await coreV1Api.listNamespacedPod(namespace);
    // res.body.items.forEach((item) => {
    //     //result.push(item.metadata.name);
    //     result.push(item.spec.containers[0].name);
    // });

    return res.body.items;
}

/**
 * namespace에 해당하는 pod들의
 * name, running status, resource 자원, 생성 시기의 정보를 반환
 */
k8sPod.getPodStatus = async (namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling getPodStatus");
    }

    let result = [];
    // namepsace에 해당하는 pod들의 정보 확인
    const res = await coreV1Api.listNamespacedPod(namespace);
    res.body.items.forEach((item) => {
        result.push({
            "name": item.spec.containers[0].name,
            "status": item.status.phase,
            "requests": {
                "cpu": item.spec.containers[0].resources.limits.cpu,
                "memory": item.spec.containers[0].resources.limits.memory
            },
            "limits": {
                "cpu": item.spec.containers[0].resources.limits.cpu,
                "memory": item.spec.containers[0].resources.limits.memory
            },
            "createTime": item.metadata.creationTimestamp
        })
    });

    return result;
}

/**
 * namespace에 해당하는 pod들의 running 상태만 반환
 */
k8sPod.listPodRunngingStatus = async (namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling getPodRunngingStatus");
    }

    // namepsace에 해당하는 pod들의 정보 확인
    const res = await coreV1Api.listNamespacedPod(namespace);

    let result = {};
    res.body.items.forEach((item) => {
        // pod의 running 상태만 추출
        _.set(result, `${item.spec.containers[0].name}`, item.status.phase)
    });

    return result;
}

/**
 * namespace에 해당하는 특정 pod의 running 상태만 반환
 */
k8sPod.getPodRunngingStatus = async (name, namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling getPodRunngingStatus");
    }

    // namepsace에 해당하는 pod들의 정보 확인
    const res = await coreV1Api.listNamespacedPod(namespace);

    let result = {};
    for (item of res.body.items) {
        // 요청 pod의 이름에 매칭되는 pod정보만 확인
        if (item.spec.containers[0].name === name) {
            // pod의 running 상태만 추출
            result['status'] = item.status.phase;
            break;
        }
    }
    if(!Object.keys(result).includes('status')) {
        throw new Error("Not lab name")
    }
    return result;
}

/**
 * pod yaml manifest를 이용하여 pod 생성 함수
 */
k8sPod.createPod = async (yaml) => {
    try {
        if (yaml == null || yaml == undefined) {
            throw new Error("Required parameter yamlPath was null or undefined when calling createPod");
        }
        let namespace = yaml.metadata.namespace;
        // yaml에 namespace가 별도로 지정 없을 경우 default로 지정
        if (!namespace) {
            namespace = 'default';
        }

        // yaml를 이용하여 pod 생성
        const result = await coreV1Api.createNamespacedPod(namespace, yaml)
        return result;
    } catch (err) {
        return err;
    }
}

/**
 * pod 삭제 함수 
 */
k8sPod.deletePod = async (podName, namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling deletePod");
    }
    if (podName == null || podName == undefined) {
        throw new Error("Required parameter podName was null or undefined when calling deletePod");
    }
    // namespace내에 존재하는 pod를 삭제
    const result = await coreV1Api.deleteNamespacedPod(podName, namespace);
    return result;
}

/**
 * 특정 pod의 정보 반환 함수
 */
k8sPod.getPod = async (name, namespace) => {
    try {
        if (name == null || name == undefined) {
            throw new Error("Required parameter name was null or undefined when calling getPod");
        }
        if (namespace == null || namespace == undefined) {
            throw new Error("Required parameter namespace was null or undefined when calling getPod");
        }
        const pod = await coreV1Api.readNamespacedPod(name, namespace);
        return pod.body;
    } catch (err) {
        throw err;
    }
}

/** 
 * pod 수정 함수
 */
k8sPod.patchPod = async (name, namespace, body) => {
    try {
        if (name == null || name == undefined) {
            throw new Error("Required parameter name was null or undefined when calling patchDeployment");
        }
        if (namespace == null || namespace == undefined) {
            throw new Error("Required parameter namespace was null or undefined when calling patchDeployment");
        }
        if (body == null || body == undefined) {
            throw new Error("Required parameter body was null or undefined when calling patchDeployment");
        }

        const options = { "headers": { "Content-type": "application/json-patch+json"}}
        const result = await coreV1Api.patchNamespacedPod(name, namespace, body, undefined, undefined, undefined, undefined, options);
        return result;
    } catch(err) {
        throw err;
    }
}

/**
 * 요청한 label이 존재하는 pod 리스트를 반환 함수
 */
k8sPod.getLabelSelector = async (labelsString, namespace) => {
    try {
        if (labelsString == null || labelsString == undefined) {
            throw new Error("Required parameter labelsString was null or undefined when calling getLabelSelector");
        }
        
        let res;
        
        if (namespace == undefined) {
            // 요청 parameter로 namespace가 없는 경우 모든 pod를 확인
            res = await coreV1Api.listPodForAllNamespaces(undefined, undefined, undefined, labelsString);
        } else {
            // 요청 parameter로 namespace가 있는 경우 해당 namespace의 pod들만 확인
            res = await coreV1Api.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, labelsString);
        }

        return res.body;
    } catch(err) {
        throw err;
    }
}

module.exports = k8sPod;