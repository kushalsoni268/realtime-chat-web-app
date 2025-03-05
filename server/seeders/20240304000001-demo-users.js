const bcrypt = require("bcryptjs")

module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("password123", salt)

    return queryInterface.bulkInsert("Users", [
      {
        username: "john_doe",
        email: "john@example.com",
        password: hashedPassword,
        name: "John Doe",
        color: "#3498db",
        status: "Online",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "jane_smith",
        email: "jane@example.com",
        password: hashedPassword,
        name: "Jane Smith",
        color: "#9b59b6",
        status: "Online",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "bob_johnson",
        email: "bob@example.com",
        password: hashedPassword,
        name: "Bob Johnson",
        color: "#2ecc71",
        status: "Online",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", null, {})
  },
}

