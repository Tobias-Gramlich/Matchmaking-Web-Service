const UserAuthenticationHandler = (payload) => {
    if (!payload.accessToken) {
        return {"error" : "No Authentication Token"};
    }

    return {}
    
};

module.exports = {UserAuthenticationHandler};