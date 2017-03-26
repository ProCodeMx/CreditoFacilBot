const CreditoFacil = require('./bot')


const bot = new CreditoFacil({
  accessToken: '405491359809635',
  verifyToken: '4babd1777e81741422e66efe27942418',
  appSecret: 'exceptionbot2017'
});

bot.start();
