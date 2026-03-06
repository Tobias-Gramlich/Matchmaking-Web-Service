const axios = require('axios');
require("dotenv").config("../../.env");

const UserAuthenticationHandler = async (payload) => {
    if (!payload.accessToken) {
        return {"error" : "No Authentication Token"};
    }

    try{
        const response = await axios.post(process.env.USER_MANAGEMENT_ROUTE, payload)
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