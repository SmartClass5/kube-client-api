const _ = require('lodash');

yamlService = {};

// service 생성을 위한 yaml -> json template 작성
yamlService.base = (config) => {
    serviceJson = {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": config.name + '-svc',
            "namespace": config.namespace
        },
        "spec": {
            "selector": {
            "app": config.name
            },
            "ports": [
                {
                    "port": config.port,
                    "targetPort": config.targetPort
                }
            ],
            "type": "ClusterIP"
        }
    }

    return serviceJson;
}

module.exports = yamlService;