const _ = require('lodash');

yamlDeploy = {};

yamlDeploy.base = (config) => {
  deployJson = {
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
      "name": config.name,
      "namespace": config.namespace
    },
    "spec": {
      "selector": {
        "matchLabels": {
          "app": config.name
        }
      },
      "template": {
        "metadata": {
          "labels": {
            "app": config.name
          }
        },
        "spec": {
          "nodeSelector": {
            "kubernetes.io/hostname": config.node
          },
          "containers": [
            {
              "name": config.name,
              "image": config.image,
              "resources": {
                "requests": {
                  "cpu": config.cpu,
                  "memory": config.memory
                },
                "limits": {
                  "cpu": config.cpu,
                  "memory": config.memory
                }
              },
              "ports": [
                {
                  "containerPort": 8888
                }
              ]
            }
          ]
        }
      }        
    }
  }

  if (Object.keys(config).includes('object')) {
    // Container Mount 권한 설정
    _.set(deployJson, 'spec.template.spec.containers[0].securityContext.privileged', true)
    _.set(deployJson, 'spec.template.spec.containers[0].securityContext.capabilities.add[0]', 'SYS_ADMIN')
    // Container Lifecycle 설정
    _.set(deployJson, 'spec.template.spec.containers[0].lifecycle.postStart.exec.command', [
      "sh", "-c",
      `echo $AWS_ACCESS_KEY_ID:$AWS_SECRET_ACCESS_KEY > $HOME/.passwd-s3fs && 
      chmod 600 $HOME/.passwd-s3fs &&
      s3fs -o use_path_request_style -o url=http://$AWS_HOST $BUCKET_NAME $HOME/work -o uid=\`id -u\`,gid=\`id -g\`,umask=077,mp_umask=077,allow_other,passwd_file=$HOME/.passwd-s3fs`
    ])
    _.set(deployJson, 'spec.template.spec.containers[0].lifecycle.preStop.exec.command', ["sh", "-c", "fusermount -u $HOME/work"])

    //// 환경변수 설정 ////
    // ConfigMap 참조 설정
    _.set(deployJson, 'spec.template.spec.containers[0].env[0].name', 'AWS_HOST')
    _.set(deployJson, 'spec.template.spec.containers[0].env[0].valueFrom.configMapKeyRef', {
        name: config.object, key: 'BUCKET_HOST'
    })
    _.set(deployJson, 'spec.template.spec.containers[0].env[1].name', 'BUCKET_NAME')
    _.set(deployJson, 'spec.template.spec.containers[0].env[1].valueFrom.configMapKeyRef', {
        name: config.object, key: 'BUCKET_NAME'
    })

    // SecretKey 참조 설정
    _.set(deployJson, 'spec.template.spec.containers[0].env[2].name', 'AWS_ACCESS_KEY_ID')
    _.set(deployJson, 'spec.template.spec.containers[0].env[2].valueFrom.secretKeyRef', {
        name: config.object, key: 'AWS_ACCESS_KEY_ID'
    })
    _.set(deployJson, 'spec.template.spec.containers[0].env[3].name', 'AWS_SECRET_ACCESS_KEY')
    _.set(deployJson, 'spec.template.spec.containers[0].env[3].valueFrom.secretKeyRef', {
        name: config.object, key: 'AWS_SECRET_ACCESS_KEY'
    })
  }

  return deployJson;
}

module.exports = yamlDeploy;