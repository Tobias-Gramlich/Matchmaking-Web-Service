const {Rooms} = require('../models');
const { Op } = require("sequelize");

const PublicJoin = async (payload) => {
    const userId = payload.userId;

    // Check if User is already in a Room
    const checkRooms = await Rooms.findOne({where : {[Op.or]: [{host: userId}, {player2: userId}, {player3: userId}, {player4: userId}]}});
    if (checkRooms) return {error: "User already in a room"};

    // Find open Rooms
    const rooms = await Rooms.findAll({
        where: {
            state: "open",
            [Op.or]: [
                { player2: null },
                { player3: null },
                { player4: null },
            ],
        },

        order: [
            ['createdAt', 'DESC']
        ]
    });

    if (rooms.length === 0) {
        const newRoom = await Rooms.create({host: userId, state: "open"});
        return {success: true};
    } 
    else {
        return {error: "not implemented"}
    }
    
};

module.exports = {PublicJoin};