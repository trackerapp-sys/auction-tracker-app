
import React, { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try to fetch user profile after login
    fetch('http://localhost:5000/profile', {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
      });
  }, []);

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/auth/facebook';
  };

  const [view, setView] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  return (
    <div style={{display: 'flex', minHeight: '100vh'}}>
      <div style={{width: 220, background: '#222', color: '#fff', padding: 24}}>
        <h2 style={{color: '#fff'}}>Auction Tracker</h2>
        {!user ? (
          <button onClick={handleFacebookLogin} style={{padding: '10px 20px', fontSize: '16px', background: '#4267B2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            Login with Facebook
          </button>
        ) : (
          <>
            <div style={{marginBottom: 24}}>
              <GroupSelectorSidebar onSelect={groupId => setSelectedGroup(groupId)} />
            </div>
            <div>
              <button style={{width: '100%', marginBottom: 12, padding: 10, background: view === 'individual' ? '#4267B2' : '#444', color: '#fff', border: 'none', borderRadius: 4}} onClick={() => setView('individual')}>Individual Auctions</button>
              <button style={{width: '100%', marginBottom: 12, padding: 10, background: view === 'live' ? '#4267B2' : '#444', color: '#fff', border: 'none', borderRadius: 4}} onClick={() => setView('live')}>Live Auctions</button>
            </div>
          </>
        )}
      </div>
      <div style={{flex: 1, padding: 32}}>
        {!user ? (
          <h2>Please log in to view auctions.</h2>
        ) : !selectedGroup ? (
          <h2>Select a Facebook group from the sidebar.</h2>
        ) : view === 'individual' ? (
          <AuctionDashboard groupId={selectedGroup} type="individual" />
        ) : view === 'live' ? (
          <AuctionDashboard groupId={selectedGroup} type="live" />
        ) : (
          <h2>Select an auction type from the sidebar.</h2>
        )}
      </div>
    </div>
  );
}

function GroupSelectorSidebar({ onSelect }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/facebook/groups', { credentials: 'include' })
      .then(res => res.ok ? res.json() : { groups: [] })
      .then(data => {
        setGroups(data.groups || []);
        setLoading(false);
      });
  }, []);

  const handleSelect = e => {
    setSelected(e.target.value);
    onSelect(e.target.value);
  };

  return (
    <div>
      <h4 style={{color: '#fff'}}>Groups</h4>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <select value={selected} onChange={handleSelect} style={{width: '100%', padding: 8, fontSize: 16}}>
          <option value="">-- Select Group --</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function AuctionDashboard({ groupId, type }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`http://localhost:5000/facebook/group/${groupId}/auctions`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setAuctions(data.auctions || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch auctions');
        setLoading(false);
      });
  }, [groupId]);

  // Auction settings (example options)
  const paymentMethods = ['PayPal', 'Bank Transfer', 'Crypto'];
  const opalTypes = ['Black Opal', 'White Opal', 'Boulder Opal', 'Crystal Opal'];

  // Conversion utility
  function caratsToGrams(carats) {
    return (carats * 0.2).toFixed(2);
  }

  return (
    <div style={{marginTop: 32}}>
      <h3>{type === 'individual' ? 'Individual Auctions' : 'Live Auctions'} for Group ID: {groupId}</h3>
      {loading && <p>Loading auctions...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!loading && !error && auctions.length === 0 && <p>No auction posts found.</p>}
      <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 16}}>
        <thead>
          <tr style={{background: '#eee'}}>
            <th style={{padding: 8, border: '1px solid #ccc'}}>User</th>
            <th style={{padding: 8, border: '1px solid #ccc'}}>Message</th>
            <th style={{padding: 8, border: '1px solid #ccc'}}>Created</th>
            <th style={{padding: 8, border: '1px solid #ccc'}}>Settings</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map(post => (
            <tr key={post.id}>
              <td style={{padding: 8, border: '1px solid #ccc'}}>{post.from?.name || 'Unknown User'}</td>
              <td style={{padding: 8, border: '1px solid #ccc'}}>{post.message}</td>
              <td style={{padding: 8, border: '1px solid #ccc'}}>{new Date(post.created_time).toLocaleString()}</td>
              <td style={{padding: 8, border: '1px solid #ccc'}}><AuctionSettings /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuctionSettings() {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [opalType, setOpalType] = useState('');
  const [carats, setCarats] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [bidderName, setBidderName] = useState('');
  const [currentBid, setCurrentBid] = useState('');

  return (
    <div style={{marginTop: 12, background: '#f9f9f9', padding: 10, borderRadius: 4}}>
      <h4>Auction Settings</h4>
      <label>Payment Method:
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{marginLeft: 8}}>
          <option value="">Select</option>
          <option value="PayPal">PayPal</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Crypto">Crypto</option>
        </select>
      </label>
      <br />
      <label>Opal Type:
        <select value={opalType} onChange={e => setOpalType(e.target.value)} style={{marginLeft: 8}}>
          <option value="">Select</option>
          <option value="Black Opal">Black Opal</option>
          <option value="White Opal">White Opal</option>
          <option value="Boulder Opal">Boulder Opal</option>
          <option value="Crystal Opal">Crystal Opal</option>
        </select>
      </label>
      <br />
      <label>Carats:
        <input type="number" value={carats} onChange={e => setCarats(e.target.value)} style={{marginLeft: 8, width: 80}} />
        {carats && <span style={{marginLeft: 8}}>{carats} ct = {caratsToGrams(carats)} g</span>}
      </label>
      <br />
      <label>Reserve Price:
        <input type="number" value={reservePrice} onChange={e => setReservePrice(e.target.value)} style={{marginLeft: 8, width: 80}} />
      </label>
      <br />
      <label>Starting Bid:
        <input type="number" value={startingBid} onChange={e => setStartingBid(e.target.value)} style={{marginLeft: 8, width: 80}} />
      </label>
      <br />
      <label>Bidder Name:
        <input type="text" value={bidderName} onChange={e => setBidderName(e.target.value)} style={{marginLeft: 8, width: 120}} />
      </label>
      <br />
      <label>Current Bid:
        <input type="number" value={currentBid} onChange={e => setCurrentBid(e.target.value)} style={{marginLeft: 8, width: 80}} />
      </label>
    </div>
  );
}
export default App;
