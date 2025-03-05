const { Model } = require("sequelize")

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Define associations
      Message.belongsTo(models.User, {
        foreignKey: "senderId",
        as: "sender",
      })

      Message.belongsTo(models.User, {
        foreignKey: "receiverId",
        as: "receiver",
      })
    }
  }

  Message.init(
    {
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Message",
    },
  )

  return Message
}

