const { ERROR } = require("@kubernetes/client-node");
const fetch = require("cross-fetch");
const { KEYCLOAK: { ADMIN_NAME, ADMIN_PASSWORD, URL } } = require('../../config/config');

let keycloakUser = {}

/**
 * keycloak admin으로 접속하기 위한 token 반환 함수
 */
keycloakUser.getAccessToken = async () => {
    let propertys = {
        'client_id': 'admin-cli',
        'grant_type': 'password',
        'username': ADMIN_NAME,
        'password': ADMIN_PASSWORD
    }

    const uri = `https://${URL}/auth/realms/master/protocol/openid-connect/token`
    
    // form type으로 요청
    const res = await fetch(uri, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams(propertys)
    })

    const resJson = await res.json()
    if(res.status === 200) {
        // access token만 추출
        const accessToken = resJson['access_token'];
        return accessToken;
    } else {
        throw new Error(`error - ${res.status} - ${resJson.error} - ${resJson.error_description}`)
    }
}

/**
 * keycloak user 생성 함수
 */
keycloakUser.createUser = async (accessToken, user, password, email) => {
    // user생성을 위한 json template
    let propertys = JSON.stringify({
        "enabled":"true",
        "username": String(user),
        "email": String(email),
        "credentials": [
            {
                "type": "password",
                "value": String(password),
                "temporary": "false"
            },
        ]
    })

    const uri = `https://${URL}/auth/admin/realms/kubernetes/users`;

    const res = await fetch(uri, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // admin token을 사용
            'Authorization': `Bearer ${accessToken}`,
        },
        body: propertys
    });

    // 생성 완료 시 201 상태값 반환
    if(res.status === 201) {
        return 'seccuess';
    } else if (res.status === 409) {
        // 생성하려는 이름으로 유저가 있는 경우
        return 'duplicate user'
    } else {
        const resJson = await res.json()
        throw new Error(`error - ${res.status} - ${resJson.error} - ${resJson.error_description}`)
    }
}

const createTest = async () => {
    const accessToken = await getAccessToken()
    if(!accessToken) {
        await createUser(accessToken, 'testuser6', 'testuser6', 'testuser6@example.com');
    }
}

module.exports = keycloakUser