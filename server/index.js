// ...existing code...

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./auth');
const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'auctiontrackersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'none',
    secure: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());

const path = require('path');

// Set Content-Security-Policy header to allow Google Fonts
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
  );
  next();
});

// Serve React static files
app.use(express.static(path.join(__dirname, 'build')));

// ...existing code...

// Facebook OAuth routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res, next) => {
    try {
      // Successful authentication
      res.redirect('/');
    } catch (err) {
      console.error('Facebook OAuth callback error:', err);
      res.status(500).send('Internal Server Error');
    }
  }
);

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// Fetch user's Facebook groups
// ...existing code...
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

// Serve React static files
app.use(express.static(path.join(__dirname, 'build')));

// Main entry for React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Fallback for React Router (should be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ...existing code...

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
