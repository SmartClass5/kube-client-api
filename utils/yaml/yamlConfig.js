const { Config } = require('@kubernetes/client-node');
const _ = require('lodash');

const yamlDeploy = require('./yamlDeploy');
const yamlService = require('./yamlService');
const yamlObject = require('./yamlObjectStorage');
const yamlNamespace = require('./yamlNamespace');
const yamlIngress = require('./yamlIngress');

let yamlConfig = {};

// object 별로 사용할 yaml 정의
const yamlSelector = {
  'deployment': yamlDeploy,
  'service': yamlService,
  'objectStorage': yamlObject,
  'namespace': yamlNamespace,
  'ingress': yamlIngress
}

// object에 해당하는 설정 정보를 넘겨주고 yaml 데이터를 반환
yamlConfig.make = (kind, config) => {
  if(!(Object.keys(yamlSelector).includes(kind))) {
    throw new Error('Not find kind');
  }
  
  yamlStr = yamlSelector[kind].base(config);
  return yamlStr;
}

module.exports = yamlConfig;