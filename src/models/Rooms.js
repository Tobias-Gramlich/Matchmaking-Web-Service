module.exports = (sequelize, DataTypes) => {

    const Rooms = sequelize.define("Rooms", {
        host: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        player2: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        player3: {
            type: DataTypes.INTEGER
        },
        player4: {
            type: DataTypes.INTEGER
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

    return Rooms;
};