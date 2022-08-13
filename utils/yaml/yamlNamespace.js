const _ = require('lodash');

yamlNamespace = {};

// namespace 생성을 위한 yaml -> json template 작성
yamlNamespace.base = (config) => {
    namespaceJson = {
        "apiVersion": "v1",
        "kind": "Namespace",
        "metadata": {
            "name": config.name,
            "labels": {
                name: "lms",
                university: config.university
            }
        }
    }

    return namespaceJson;
}

module.exports = yamlNamespace;