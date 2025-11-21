const bcrypt = require('bcrypt');

const plainTextPassword = 'ciaociao';
const saltRounds = 10;

bcrypt.hash(plainTextPassword, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hashed Password:', hash);
});
