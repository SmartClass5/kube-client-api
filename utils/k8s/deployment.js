const k8sApi = require('./client');

const appsV1Api = k8sApi.makeApi('deployment');

let k8sDeploy = {};

k8sDeploy.listDeploymentName = async (namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling listDeployment");
    }

    let result = [];
    const res = await appsV1Api.listNamespacedDeployment(namespace);
    res.body.items.forEach((item) => {
        result.push(item.metadata.name);
    });

    return result;
}

k8sDeploy.getDeployment = async (name, namespace) => {
    try {
        if (name == null || name == undefined) {
            throw new Error("Required parameter name was null or undefined when calling getDeployment");
        }
        if (namespace == null || namespace == undefined) {
            throw new Error("Required parameter namespace was null or undefined when calling getDeployment");
        }
        const deploy = await appsV1Api.readNamespacedDeployment(name, namespace);
        return deploy.body;
    } catch (err) {
        throw err;
    }
}

k8sDeploy.patchDeployment = async (name, namespace, body) => {
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
        const result = await appsV1Api.patchNamespacedDeployment(name, namespace, body, undefined, undefined, undefined, undefined, options);
        return result;
    } catch(err) {
        throw err;
    }
}

k8sDeploy.createDeployment = async (yaml) => {
    try {
        if (yaml == null || yaml == undefined) {
            throw new Error("Required parameter yaml was null or undefined when calling createDeployment");
        }
        let namespace = yaml.metadata.namespace;
        if (!namespace) {
            namespace = 'default';
        }

        const result = await appsV1Api.createNamespacedDeployment(namespace, yaml);

        return true;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

k8sDeploy.deleteDeployment = async (deployName, namespace) => {
    if (namespace == null || namespace == undefined) {
        throw new Error("Required parameter namespace was null or undefined when calling deleteDeployment");
    }
    if (deployName == null || deployName == undefined) {
        throw new Error("Required parameter deployName was null or undefined when calling deleteDeployment");
    }
    const result = await appsV1Api.deleteNamespacedDeployment(deployName, namespace);
    return result;
}

module.exports = k8sDeploy;