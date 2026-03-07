const axios = require('axios');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

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
    catch (err){
        console.log(err);
        return{"error": "Something went wrong"}
    }
};

module.exports = {UserAuthenticationHandler};