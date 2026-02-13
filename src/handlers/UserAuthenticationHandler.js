const UserAuthenticationHandler = (payload) => {
    if (!payload.accessToken) {
        return {"error" : "No Authentication Token"};
    }

    //TODO: Authentication mit Axios

    return {"userId": 1, "userName": "TestName"};
    
};

module.exports = {UserAuthenticationHandler};