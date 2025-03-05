const { Model } = require("sequelize")
const bcrypt = require("bcryptjs")

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations
      // Users can have many contacts (other users)
      User.belongsToMany(models.User, {
        through: models.Contact,
        as: "contacts",
        foreignKey: "userId",
        otherKey: "contactId",
      })

      // Users can be contacts of many other users
      User.belongsToMany(models.User, {
        through: models.Contact,
        as: "contactOf",
        foreignKey: "contactId",
        otherKey: "userId",
      })

      User.hasMany(models.Message, {
        foreignKey: "senderId",
        as: "sentMessages",
      })

      User.hasMany(models.Message, {
        foreignKey: "receiverId",
        as: "receivedMessages",
      })
    }

    // Instance method to validate password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password)
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 30],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        defaultValue: "#1abc9c",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Online",
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password, salt)
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password, salt)
          }
        },
      },
    },
  )

  return User
}

