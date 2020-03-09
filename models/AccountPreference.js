const connection = require('../database/connection');
const Account = require('./Account');
const Preference = require('./Preference');

const AccountPreference = connection.sequelize.define('account_preferences');
Account.belongsToMany(Preference, { through: AccountPreference });
Preference.belongsToMany(Account, { through: AccountPreference });

module.exports = AccountPreference;