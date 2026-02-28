const axios = require('axios');

const UserAuthenticationHandler = async (payload) => {
    if (!payload.accessToken) {
        return {"error" : "No Authentication Token"};
    }

    //TODO: Other Connection Path
    try{
        const response = await axios.post("http://localhost:3001/Users/auth", payload)
        if(response.data.error){
            return {"error": response.data.error};
        }
        else{
            return {"userName": response.data.username, "userId": response.data.userId};
        }
    }
    catch{
        return{"error": "Something went wrong"}
    }
};

module.exports = {UserAuthenticationHandler};