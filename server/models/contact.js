const { Model } = require("sequelize")

module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      // Define associations
      // Contact belongs to a User (the user who added the contact)
      Contact.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      })

      // Contact belongs to a User (the contact)
      Contact.belongsTo(models.User, {
        foreignKey: "contactId",
        as: "contact",
      })
    }
  }

  Contact.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      contactId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Contact",
      indexes: [
        {
          unique: true,
          fields: ["userId", "contactId"],
        },
      ],
    },
  )

  return Contact
}

