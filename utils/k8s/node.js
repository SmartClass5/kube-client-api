const k8sClient = require('./client');
const _ = require('lodash');

const k8sApi = k8sClient.makeApi('node');

let k8sNode = {};

/**
 * kubernetes의 실습실 생성할 노드들 이름 반환
 */
k8sNode.listNodeNames = async () => {
    try {
        let nodeNames = [];
        nodeInfo = await k8sApi.listNode();
        nodeInfo.body.items.forEach( (item) => {
            // node label의 type이 compute인 경우만 반환
            // 해당 노드에서만 실습실 생성
            if (item.metadata.labels['type'] == 'compute') { 
                nodeNames.push(item.metadata.name);
            }
        });

        return nodeNames;
    } catch (err) {
        throw err;
    }
}

/**
 * node의 자원 정보 반환 함수
 */
k8sNode.listNodeResources = async (nodeName) => {
    try {
        let nodeInfo;
        let nodeList = {};
        
        // 특정 node를 지정하지 않는 경우
        if(nodeName == undefined || nodeName == null) {
            // 모든 node 정보를 확인
            nodeInfo = await k8sApi.listNode();
            nodeInfo.body.items.forEach( (item) => {
                // label의 type이 compute인 노드만 체크
                if (item.metadata.labels['type'] == 'compute') { 
                    // cpu와 memory 정보 추출
                    _.set(nodeList, `${item.metadata.name}.cpu`, +item.status.capacity.cpu);
                    _.set(nodeList, `${item.metadata.name}.memory`, k8sClient.convertUnit(item.status.capacity.memory,'memory'));
                }
            });
        } else {
            // 특정 node를 지정한 경우
            // 해당 node 정보를 확인
            nodeInfo = await k8sApi.readNode(nodeName)
            const item = nodeInfo.body;
            // cpu와 memory 정보 추출
            _.set(nodeList, `${item.metadata.name}.cpu`, +item.status.capacity.cpu);
            _.set(nodeList, `${item.metadata.name}.memory`, k8sClient.convertUnit(item.status.capacity.memory,'memory'));
        }
        
        // node들의 resource 체크
        for (node in nodeList) { 
            // node에 배포되어 있는 pod 확인
            const podList = await k8sApi.listPodForAllNamespaces(undefined,undefined,`spec.nodeName=${node}`);

            let resources = {};
            _.set(resources, 'name', node);

            let reqCpu = 0, reqMem = 0, limitCpu = 0, limitMem = 0;
            // pod들의 resource 추출하여 node에서 사용 중인 총 resource 체크
            podList.body.items.forEach( (item) => {
                if(item.spec.containers[0].resources.requests != undefined) {
                    if(item.spec.containers[0].resources.requests.cpu != undefined) {
                        reqCpu += k8sClient.convertUnit(item.spec.containers[0].resources.requests.cpu, 'cpu');
                    }
                    if(item.spec.containers[0].resources.requests.memory != undefined) {
                        reqMem += k8sClient.convertUnit(item.spec.containers[0].resources.requests.memory, 'memory');
                    }
                }
                if(item.spec.containers[0].resources.limits != undefined) {
                    if(item.spec.containers[0].resources.limits.cpu != undefined) {
                        limitCpu += k8sClient.convertUnit(item.spec.containers[0].resources.limits.cpu, 'cpu');
                    }
                    if(item.spec.containers[0].resources.limits.memory != undefined) {
                        limitMem += k8sClient.convertUnit(item.spec.containers[0].resources.limits.memory, 'memory');
                    }
                }
            });
            
            const pctReqCpu = Math.round((reqCpu / nodeList[node].cpu) * 100) / 100;
            const pctReqMem = Math.round((reqMem / nodeList[node].memory) * 100) / 100;
            const pctLimitCpu = Math.round((limitCpu / nodeList[node].cpu) * 100) / 100;
            const pctLimitMem = Math.round((limitMem / nodeList[node].memory) * 100) / 100;
            _.set(nodeList, `${node}.reqCpu`, Math.round((reqCpu * 100)/100));
            _.set(nodeList, `${node}.reqMem`, Math.round((reqMem * 100)/100));
            _.set(nodeList, `${node}.limitCpu`, Math.round((limitCpu * 100)/100));
            _.set(nodeList, `${node}.limitMem`, Math.round((limitMem * 100)/100));
            _.set(nodeList, `${node}.pctReqCpu`, pctReqCpu);
            _.set(nodeList, `${node}.pctReqMem`, pctReqMem);
            _.set(nodeList, `${node}.pctLimitCpu`, pctLimitCpu);
            _.set(nodeList, `${node}.pctLimitMem`, pctLimitMem);
        }
        
        return nodeList;
    } catch (err) {
        throw err;
    }
}


module.exports = k8sNode;