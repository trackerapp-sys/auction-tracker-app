
import React, { useEffect, useState } from 'react';

// Utility to persist tracker URL
function getSavedTrackerUrl() {
  return localStorage.getItem('opalTrackerUrl');
}

function setSavedTrackerUrl(url) {
  localStorage.setItem('opalTrackerUrl', url);
}

function getDefaultTrackerUrl() {
  const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'http:';
  return isDevelopment ? 'http://localhost:5001' : 'https://opaltracker.onrender.com';
}

function App() {
  const [user, setUser] = useState(null);
  const [trackerUrl, setTrackerUrl] = useState(getSavedTrackerUrl() || getDefaultTrackerUrl());
  const [showUrlEditor, setShowUrlEditor] = useState(false);
  const [view, setView] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    // Try to fetch user profile after login
    fetch(`${trackerUrl}/profile`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
      });
  }, [trackerUrl]);

  const handleFacebookLogin = () => {
    window.location.href = `${trackerUrl}/auth/facebook`;
  };

  // Keyboard shortcut: Ctrl+Shift+U to open URL editor
  useEffect(() => {
    const handler = e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        setShowUrlEditor(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{display: 'flex', minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif'}}>
      <div style={{width: 220, background: '#222', color: '#fff', padding: 24, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <h2 style={{color: '#fff', fontFamily: 'Arial, Helvetica, sans-serif'}}>Auction Tracker</h2>
        <button onClick={() => setShowUrlEditor(true)} style={{marginBottom: 12, background: '#4a9eff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Arial, Helvetica, sans-serif'}}>Edit Tracker URL</button>
        {showUrlEditor && (
          <UrlEditor
            trackerUrl={trackerUrl}
            setTrackerUrl={url => {
              setTrackerUrl(url);
              setSavedTrackerUrl(url);
            }}
            onClose={() => setShowUrlEditor(false)}
          />
        )}
        {!user ? (
          <button onClick={handleFacebookLogin} style={{padding: '10px 20px', fontSize: '16px', background: '#4267B2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Arial, Helvetica, sans-serif'}}>
            Login with Facebook
          </button>
        ) : (
          <>
            <div style={{marginBottom: 24}}>
              <GroupSelectorSidebar trackerUrl={trackerUrl} onSelect={groupId => setSelectedGroup(groupId)} />
            </div>
            <div>
              <button style={{width: '100%', marginBottom: 12, padding: 10, background: view === 'individual' ? '#4267B2' : '#444', color: '#fff', border: 'none', borderRadius: 4, fontFamily: 'Arial, Helvetica, sans-serif'}} onClick={() => setView('individual')}>Individual Auctions</button>
              <button style={{width: '100%', marginBottom: 12, padding: 10, background: view === 'live' ? '#4267B2' : '#444', color: '#fff', border: 'none', borderRadius: 4, fontFamily: 'Arial, Helvetica, sans-serif'}} onClick={() => setView('live')}>Live Auctions</button>
            </div>
          </>
        )}
      </div>
      <div style={{flex: 1, padding: 32, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        {!user ? (
          <h2 style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Please log in to view auctions.</h2>
        ) : !selectedGroup ? (
          <h2 style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Select a Facebook group from the sidebar.</h2>
        ) : view === 'individual' ? (
          <AuctionDashboard trackerUrl={trackerUrl} groupId={selectedGroup} type="individual" />
        ) : view === 'live' ? (
          <AuctionDashboard trackerUrl={trackerUrl} groupId={selectedGroup} type="live" />
        ) : (
          <h2 style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Select an auction type from the sidebar.</h2>
        )}
      </div>
    </div>
  );
}

function UrlEditor({ trackerUrl, setTrackerUrl, onClose }) {
  const [url, setUrl] = useState(trackerUrl);
  const [status, setStatus] = useState('');

  const handleUpdate = () => {
    if (url) {
      setTrackerUrl(url.trim());
      setStatus(`✅ URL updated to: ${url.trim()}`);
    }
  };

  const handleTest = async () => {
    setStatus('🔄 Testing connection...');
    try {
      const response = await fetch(`${url.trim()}/api/health`);
      if (response.ok) {
        setStatus('✅ Connection successful!');
      } else {
        setStatus('❌ Connection failed - server responded with error');
      }
    } catch (error) {
      setStatus('❌ Connection failed - ' + error.message);
    }
  };

  return (
    <div style={{position: 'fixed', top: 10, right: 10, background: '#1a1a1a', color: 'white', padding: 15, borderRadius: 8, border: '2px solid #4a9eff', zIndex: 999999, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: 300}}>
      <div style={{marginBottom: 10, fontWeight: 'bold', color: '#4a9eff'}}>🔧 Opal Tracker URL Editor</div>
      <div style={{marginBottom: 8}}>
        <label style={{display: 'block', marginBottom: 4}}>Tracker URL:</label>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} style={{width: '100%', padding: 4, border: '1px solid #555', background: '#333', color: 'white', borderRadius: 4, fontFamily: 'Arial, Helvetica, sans-serif'}} />
      </div>
      <div style={{marginBottom: 8}}>
        <button onClick={handleUpdate} style={{background: '#4a9eff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', marginRight: 8, fontFamily: 'Arial, Helvetica, sans-serif'}}>Update URL</button>
        <button onClick={handleTest} style={{background: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', marginRight: 8, fontFamily: 'Arial, Helvetica, sans-serif'}}>Test Connection</button>
        <button onClick={onClose} style={{background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: 'Arial, Helvetica, sans-serif'}}>Close</button>
      </div>
      <div style={{fontSize: 11, color: '#ccc', marginTop: 8, fontFamily: 'Arial, Helvetica, sans-serif'}}>{status}</div>
    </div>
  );
}
function GroupSelectorSidebar({ trackerUrl, onSelect }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${trackerUrl}/facebook/groups`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : { groups: [] })
      .then(data => {
        setGroups(data.groups || []);
        setLoading(false);
      });
  }, [trackerUrl]);

  const handleSelect = e => {
    setSelected(e.target.value);
    onSelect(e.target.value);
  };

  return (
    <div style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
      <h4 style={{color: '#fff', fontFamily: 'Arial, Helvetica, sans-serif'}}>Groups</h4>
      {loading ? (
        <p style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Loading...</p>
      ) : (
        <select value={selected} onChange={handleSelect} style={{width: '100%', padding: 8, fontSize: 16, fontFamily: 'Arial, Helvetica, sans-serif'}}>
          <option value="">-- Select Group --</option>
          {groups.map(group => (
            <option key={group.id} value={group.id} style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>{group.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function AuctionDashboard({ trackerUrl, groupId, type }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${trackerUrl}/facebook/group/${groupId}/auctions`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setAuctions(data.auctions || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch auctions');
        setLoading(false);
      });
  }, [trackerUrl, groupId]);

  // Auction settings (example options)
  const paymentMethods = ['PayPal', 'Bank Transfer', 'Crypto'];
  const opalTypes = ['Black Opal', 'White Opal', 'Boulder Opal', 'Crystal Opal'];

  // Conversion utility
  function caratsToGrams(carats) {
    return (carats * 0.2).toFixed(2);
  }

  return (
    <div style={{marginTop: 32, fontFamily: 'Arial, Helvetica, sans-serif'}}>
      <h3 style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>{type === 'individual' ? 'Individual Auctions' : 'Live Auctions'} for Group ID: {groupId}</h3>
      {loading && <p style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Loading auctions...</p>}
      {error && <p style={{color: 'red', fontFamily: 'Arial, Helvetica, sans-serif'}}>{error}</p>}
      {!loading && !error && auctions.length === 0 && <p style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>No auction posts found.</p>}
      <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 16, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <thead>
          <tr style={{background: '#eee', fontFamily: 'Arial, Helvetica, sans-serif'}}>
            <th style={{padding: 8, border: '1px solid #ccc', fontFamily: 'Arial, Helvetica, sans-serif'}}>User</th>
            <th style={{padding: 8, border: '1px solid #ccc', fontFamily: 'Arial, Helvetica, sans-serif'}}>Message</th>
            <th style={{padding: 8, border: '1px solid #ccc', fontFamily: 'Arial, Helvetica, sans-serif'}}>Created</th>
            <th style={{padding: 8, border: '1px solid #ccc', fontFamily: 'Arial, Helvetica, sans-serif'}}>Settings</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map(post => (
            <tr key={post.id} style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
              <td style={{padding: 8, border: '1px solid #ccc', fontFamily: 'Arial, Helvetica, sans-serif'}}>{post.from?.name || 'Unknown User'}</td>
              <td style={{padding: 8, border: '1px solid #ccc', fontFamily: 'Arial, Helvetica, sans-serif'}}>{post.message}</td>
              <td style={{padding: 8, border: '1px solid #ccc', fontFamily: 'Arial, Helvetica, sans-serif'}}>{new Date(post.created_time).toLocaleString()}</td>
              <td style={{padding: 8, border: '1px solid #ccc', fontFamily: 'Arial, Helvetica, sans-serif'}}><AuctionSettings /></td>
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
    <div style={{marginTop: 12, background: '#f9f9f9', padding: 10, borderRadius: 4, fontFamily: 'Arial, Helvetica, sans-serif'}}>
      <h4 style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Auction Settings</h4>
      <label style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Payment Method:
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{marginLeft: 8, fontFamily: 'Arial, Helvetica, sans-serif'}}>
          <option value="">Select</option>
          <option value="PayPal">PayPal</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Crypto">Crypto</option>
        </select>
      </label>
      <br />
      <label style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Opal Type:
        <select value={opalType} onChange={e => setOpalType(e.target.value)} style={{marginLeft: 8, fontFamily: 'Arial, Helvetica, sans-serif'}}>
          <option value="">Select</option>
          <option value="Black Opal">Black Opal</option>
          <option value="White Opal">White Opal</option>
          <option value="Boulder Opal">Boulder Opal</option>
          <option value="Crystal Opal">Crystal Opal</option>
        </select>
      </label>
      <br />
      <label style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Carats:
        <input type="number" value={carats} onChange={e => setCarats(e.target.value)} style={{marginLeft: 8, width: 80, fontFamily: 'Arial, Helvetica, sans-serif'}} />
        {carats && <span style={{marginLeft: 8, fontFamily: 'Arial, Helvetica, sans-serif'}}>{carats} ct = {caratsToGrams(carats)} g</span>}
      </label>
      <br />
      <label style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Reserve Price:
        <input type="number" value={reservePrice} onChange={e => setReservePrice(e.target.value)} style={{marginLeft: 8, width: 80, fontFamily: 'Arial, Helvetica, sans-serif'}} />
      </label>
      <br />
      <label style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Starting Bid:
        <input type="number" value={startingBid} onChange={e => setStartingBid(e.target.value)} style={{marginLeft: 8, width: 80, fontFamily: 'Arial, Helvetica, sans-serif'}} />
      </label>
      <br />
      <label style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Bidder Name:
        <input type="text" value={bidderName} onChange={e => setBidderName(e.target.value)} style={{marginLeft: 8, width: 120, fontFamily: 'Arial, Helvetica, sans-serif'}} />
      </label>
      <br />
      <label style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Current Bid:
        <input type="number" value={currentBid} onChange={e => setCurrentBid(e.target.value)} style={{marginLeft: 8, width: 80, fontFamily: 'Arial, Helvetica, sans-serif'}} />
      </label>
    </div>
  );
}
export default App;
