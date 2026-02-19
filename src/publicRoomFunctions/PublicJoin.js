const {Rooms} = require('../models');
const { Op } = require("sequelize");

const PublicJoin = async (payload) => {
    const userId = payload.userId;

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
        // Create a Room
    } 
    else {
        // Join existing Room
    }
    return;
};

module.exports = {PublicJoin};