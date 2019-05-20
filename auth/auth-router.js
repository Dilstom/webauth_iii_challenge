const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secret');

const generateToken = user => {
 const payload = {
  subject: user.id,
  username: user.username,
  roles: ['Student'],
 };
 const options = {
  expiresIn: '1h',
 };

 return jwt.sign(payload, secrets.jwtSecret, options);
};

const Users = require('../users/users-model');

router.post('/register', (req, res) => {
 let user = req.body;
 const hash = bcrypt.hashSync(user.password, 10);
 user.password = hash;

 Users.add(user)
  .then(saved => {
   res.status(201).json(saved);
  })
  .catch(err => {
   res.status(500).json(err);
  });
});
router.post('/login', (req, res) => {
 let { username, password } = req.body;

 Users.findBy({ username })
  .then(user => {
   if (user && bcrypt.compareSync(password, user.password)) {
    const token = generateToken(user);
    res.status(200).json({
     message: `Welcome ${user.username}!, have a token: `,
     token,
     roles: token.roles,
    });
   } else {
    res.status(401).json({ message: 'Invalid credentials' });
   }
  })
  .catch(err => {
   res.status(500).json(err);
  });
});

module.exports = router;
