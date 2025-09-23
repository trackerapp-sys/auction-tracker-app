// ...existing code...

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./auth');
const app = express();

app.use(cors());
app.use(express.json());
app.use(session({ secret: 'auctiontrackersecret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Auction Tracker Server Running');
});

// Facebook OAuth routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('http://localhost:3000');
  }
);


app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// Fetch user's Facebook groups
const axios = require('axios');
app.get('/facebook/groups', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    // You may need to store accessToken in session or user object
    const accessToken = req.user.accessToken || req.session.accessToken;
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token found' });
    }
    const response = await axios.get(`https://graph.facebook.com/v19.0/me/groups`, {
      params: {
        access_token: accessToken,
        fields: 'id,name',
      },
    });
    res.json({ groups: response.data.data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
