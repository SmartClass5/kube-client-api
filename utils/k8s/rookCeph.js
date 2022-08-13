const k8sClient = require('./client');

const k8sApi = k8sClient.makeApi('obeject');

let k8sCeph = {}

/**
 * object storage의 리스트 반환
 */
k8sCeph.listObjectStorage = async (namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling listObjectStorage");
    }

    let result = [];

    // rook ceph의 object storage경우 제공되는 api가 없어 custom api로 url path 설정하여 사용
    const path = `namespaces/${namespace}/objectbucketclaims`
    const res = await k8sApi.listClusterCustomObject('objectbucket.io','v1alpha1', path);
    res.body.items.forEach((item) => {
        result.push(item);
    });

    return result;
}

/**
 * object storage 생성 함수
 */
k8sCeph.createObjectStorage = async (yaml) => {
    try {
        if (yaml == null || yaml == undefined) {
            throw new Error("Required parameter yaml was null or undefined when calling createObjectStorage");
        }

        // namespace가 없을 경우 default로 지정
        let namespace = yaml.metadata.namespace;
        if (!namespace) {
            namespace = 'default';
        }

        const path = `namespaces/${namespace}/objectbucketclaims`
        await k8sApi.createClusterCustomObject('objectbucket.io','v1alpha1', path, yaml);

        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * object storage 삭제 함수
 */
k8sCeph.deleteObjectStorage = async (objectName, namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling deleteObjectStorage");
    }
    if (objectName == null || objectName == undefined) {
        throw new Error("Required parameter objectName was null or undefined when calling deleteObjectStorage");
    }

    const path = `namespaces/${namespace}/objectbucketclaims`
    const result = await k8sApi.deleteClusterCustomObject('objectbucket.io','v1alpha1', path, objectName);
    
    return result;
}

module.exports = k8sCeph;