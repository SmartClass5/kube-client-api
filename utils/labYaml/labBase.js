const _ = require('lodash');

let labBase = {};

/**
 * 실습실 생성 시 사용할 yaml manifest의 기본 template
 */
getPodJson = (name, namespace, labType, image, version, cpu, memory, timer, university) => {
    // 실습실 제한 시간을 사용할 경우 기본 값으로 요청한 시간의 40분뒤를 설정
    const utc = Math.round(new Date().getTime()/1000) + (40*60);
    
    const base = {
        "apiVersion": "v1",
        "kind": "Pod",
        "metadata": {
            "name": name,
            "namespace": namespace,
            "labels": {
                "labType": labType,
                "endDate": "" + utc,
                "app": name,
                "timer": "" + timer,
                "university": "" + university
            }
        },
        "spec": {
            "containers": [
                {
                    "name": name,
                    "image": `${image}:${version}`,
                    "resources": {
                        "requests": {
                            "cpu": cpu,
                            "memory": memory
                        },
                        "limits": {
                            "cpu": cpu,
                            "memory": memory
                        }
                    },
                }
            ]
        }
    }

    return base;
}

/**
 * pod의 manifest 관리 class
 */
class podManifest {
    constructor(name, namespace, labType, image, version, cpu, memory, timer, university) {
        this.name = name;
        this.namespace = namespace;
        this.labType = labType;
        this.image = image;
        this.version = version;
        this.cpu = cpu;
        this.memory = memory;
        this.timer = timer;
        this.university = university;

        // 기본 yaml template 생성
        this.manifest = getPodJson(name, namespace, labType, image, version, cpu, memory, timer, university);
    }

    // pod에 환경변수(env) 추가 메소드
    setEnv(env) {
        // 현재 manifest에 env가 있는지 확인
        let envs = _.get(this.manifest, `spec.containers[0].env`);
        let envCount;
        // env가 존재할 경우 해당 env를 유지하고 env 추가하기 위해 index 위치 체크
        if(envs != undefined) {
            envCount = envs.length;
        } else {
            envCount = 0;
        }

        // env 추가
        for (const [key, value] of Object.entries(env)) {
            _.set(this.manifest, `spec.containers[0].env[${envCount}]`, {
                "name": key,
                "value": value
            });
            envCount++;
        }
    }

    // yaml manifest에 command 추가 메소드
    setCommand(command) {
        let commandCount = 0;
        command.forEach((value) => {
            _.set(this.manifest, `spec.containers[0].command[${commandCount}]`, value);
            commandCount++;
        })
    }

    // yaml manifest의 args 추가 메소드
    setArgs(args) {
        let argsCount = 0;
        args.forEach((value) => {
            _.set(this.manifest, `spec.containers[0].args[${argsCount}]`, value);
            argsCount++;
        })
    }

    // pod manifest의 port 설정 메소드
    setPort(port) {
        _.set(this.manifest, `spec.containers[0].containerPort`, port);
    }

    // pod manifest의 배포할 node를 설정하는 메소드
    setNode(node) {
        _.set(this.manifest, `spec.nodeSelector['kubernetes.io/hostname']`, node);
    }

    // object storage mount할 경우 설정하는 메소드
    setMount(bucket, passDir, mountDir) {
        // 현재 manifest에 env가 있는지 확인
        let envs = _.get(this.manifest, `spec.containers[0].env`);
        let envCount = 0;
        // env가 존재할 경우 해당 env를 유지하고 env 추가하기 위해 index 위치 체크
        if(envs != undefined) {
            envCount = envs.length;
        } else {
            envCount = 0;
        }
        
        // configmap에서 env 확인
        // object storage를 mount하기 위한 정보 추출
        _.set(this.manifest, `spec.containers[0].env[${envCount}].name`, 'AWS_HOST')
        _.set(this.manifest, `spec.containers[0].env[${envCount}].valueFrom.configMapKeyRef`, {
            name: bucket, key: 'BUCKET_HOST'
        })
        envCount++;
        _.set(this.manifest, `spec.containers[0].env[${envCount}].name`, 'BUCKET_NAME')
        _.set(this.manifest, `spec.containers[0].env[${envCount}].valueFrom.configMapKeyRef`, {
            name: bucket, key: 'BUCKET_NAME'
        })
        envCount++;

        // secret에서 env 확인
        // object storage를 mount하기 위한 정보 추출
        _.set(this.manifest, `spec.containers[0].env[${envCount}].name`, 'AWS_ACCESS_KEY_ID')
        _.set(this.manifest, `spec.containers[0].env[${envCount}].valueFrom.secretKeyRef`, {
            name: bucket, key: 'AWS_ACCESS_KEY_ID'
        })
        envCount++;
        _.set(this.manifest, `spec.containers[0].env[${envCount}].name`, 'AWS_SECRET_ACCESS_KEY')
        _.set(this.manifest, `spec.containers[0].env[${envCount}].valueFrom.secretKeyRef`, {
            name: bucket, key: 'AWS_SECRET_ACCESS_KEY'
        })
        envCount++;

        // mount되는 object storage의 이름을 label에 저장
        let labels = _.get(this.manifest, `metadata.labels`);
        _.set(labels, 'storageName', bucket)
        _.set(this.manifest, `metadata.labels`, labels);

        // Container Mount 권한 설정
        _.set(this.manifest, 'spec.containers[0].securityContext.privileged', true)
        _.set(this.manifest, 'spec.containers[0].securityContext.capabilities.add[0]', 'SYS_ADMIN')
        
        // Container Lifecycle 설정
        // pod 실행 시 mount 하도록 설정
        _.set(this.manifest, 'spec.containers[0].lifecycle.postStart.exec.command', [
            "sh", "-c",
            `echo $AWS_ACCESS_KEY_ID:$AWS_SECRET_ACCESS_KEY > ${passDir}/.passwd-s3fs && 
            mkdir -p ${mountDir} &&
            chmod 600 ${passDir}/.passwd-s3fs &&
            sudo s3fs -o use_path_request_style -o url=http://$AWS_HOST $BUCKET_NAME ${mountDir} -o uid=\`id -u\`,gid=\`id -g\`,umask=000,mp_umask=000,allow_other,passwd_file=${passDir}/.passwd-s3fs`
        ])
        // pod 종료 시 umount 진행
        _.set(this.manifest, 'spec.containers[0].lifecycle.preStop.exec.command', ["sh", "-c", `fusermount -u ${mountDir}`])
    }

    // yaml manifest 반환 메소드
    getManifest() {
        return this.manifest;
    }
}

module.exports = podManifest;