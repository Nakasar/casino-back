const app = require('./app');

app.start().catch(err => {
  console.error('Terminate application CASINO.');

  process.exit(1);
});
