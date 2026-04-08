const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect:  'mssql',
  host:     'group-management.database.windows.net',
  port:      1433,
  database: 'group_management',
  username: 'Admin_Stokvel',
  password: 'Management@6',
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  },
  logging: false,
});

// import each model and pass in the sequelize connection
const User         = require('../common/models/User')(sequelize);
const Group        = require('../common/models/Group')(sequelize);
const Member       = require('../common/models/Member')(sequelize);
const Contribution = require('../common/models/Contribution')(sequelize);

// define relationships
User.hasMany(Member);
Member.belongsTo(User);
Group.hasMany(Member);
Member.belongsTo(Group);
Group.hasMany(Contribution);
Contribution.belongsTo(Group);
User.hasMany(Contribution);
Contribution.belongsTo(User);

sequelize.authenticate()
  .then(() => console.log('Connected to Azure SQL'))
  .catch((e) => console.error('Connection failed:', e.message));

module.exports = { sequelize, User, Group, Member, Contribution };