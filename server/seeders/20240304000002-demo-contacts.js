module.exports = {
  async up(queryInterface, Sequelize) {
    // Get user IDs from the database
    const users = await queryInterface.sequelize.query("SELECT id FROM Users;", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    })

    if (users.length < 3) return

    return queryInterface.bulkInsert("Contacts", [
      {
        userId: users[0].id,
        contactId: users[1].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: users[0].id,
        contactId: users[2].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: users[1].id,
        contactId: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Contacts", null, {})
  },
}

