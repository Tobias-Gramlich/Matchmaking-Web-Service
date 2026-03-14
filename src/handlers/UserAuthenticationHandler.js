const axios = require('axios');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const UserAuthenticationHandler = async (payload) => {
    //* Check for Access Token
    if (!payload.accessToken) {
        return {"error" : "No Authentication Token"};
    }

    //* Validate Token with User Management
    try{
        const response = await axios.post(process.env.USER_MANAGEMENT_ROUTE, payload)
        if(response.data.error){
            return {"error": response.data.error};
        }
        else{
            //* Return Username and ID
            return {"userName": response.data.username, "userId": response.data.userId};
        }
    }
    catch (err){
        console.log(err);
        return{"error": "Something went wrong"}
    }
};

module.exports = {UserAuthenticationHandler};