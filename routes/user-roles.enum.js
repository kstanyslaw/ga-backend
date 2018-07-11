var roles = {};

roles[roles[-30] = 'blackList'] = -30;
roles[roles[-20] = 'banned'] = -20;
roles[roles[-10] = 'deleted'] = -10;
roles[roles[0] = 'unconfirmed'] = 0;
roles[roles[10] = 'user'] = 10;
roles[roles[20] = 'singlePaid'] = 20;
roles[roles[30] = 'corporatePaid'] = 30;
roles[roles[40] = 'grantor'] = 40;
roles[roles[50] = 'moderator'] = 50;
roles[roles[80] = 'administrator'] = 80;
roles[roles[100] = 'root'] = 100;

roles = Object.freeze(roles);

module.exports = roles;