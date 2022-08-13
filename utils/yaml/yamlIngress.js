const _ = require('lodash');
const { k8s: { ingressDomain } } = require('../../config/config');

yamlIngress = {};

// ingress 생성을 위한 yaml -> json template 작성
yamlIngress.base = (config) => {
    ingressJson = {
        "apiVersion": "networking.k8s.io/v1",
        "kind": "Ingress",
        "metadata": {
            "name": `${config.name}-ingress`,
            "namespace": config.namespace,
            "annotations": {
                "ingress.kubernetes.io/proxy-body-size": "0",
                "nginx.ingress.kubernetes.io/proxy-body-size": "0"
            },
        },
        "spec": {
            "rules": [
                {
                    "host": `${config.name}.${ingressDomain}`,
                    "http": {
                        "paths": [
                            {
                                "pathType": "Prefix",
                                "path": "/",
                                "backend": {
                                    "service": {
                                        "name": `${config.name}-svc`,
                                        "port": {
                                            "number": 80
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }

    return ingressJson;
}

module.exports = yamlIngress;