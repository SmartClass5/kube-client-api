const _ = require('lodash');

yamlSecrets = {};

// secret 생성을 위한 yaml -> json template 작성
yamlSecrets.base = (config) => {
    namespaceJson = {
        "apiVersion": "v1",
        "kind": "Secret",
        "metadata": {
            "name": config.name,
            "namespace": config.namespace
        },
        "data": config.data,
        "type": config.type
    }

    return namespaceJson;
}

module.exports = yamlSecrets;