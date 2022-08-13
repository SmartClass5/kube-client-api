const { V1NamespaceList } = require('@kubernetes/client-node');
const _ = require('lodash');

yamlObject = {};

// object storage 생성을 위한 yaml -> json template 작성
yamlObject.base = (config) => {
    let cephJson = {
        "apiVersion": "objectbucket.io/v1alpha1",
        "kind": "ObjectBucketClaim",
        "metadata": {
            "name": config.name,
            "namespace": config.namespace
        },
        "spec": {
            // "bucketName": config.name,
            "generateBucketName": config.name,
            "storageClassName": config.storageName,
            "additionalConfig" : {
                "maxSize": "10G"
            }
        }
    };
    
    if (Object.keys(config).includes('size')) {
        _.set(cephJson, 'spec.additionalConfig.maxSize', config.size);
    }

    return cephJson;
}

module.exports = yamlObject;