import React, { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import './rsostyles.css';

const RSOCard = ({ rso, handleJoin, handleLeave, userRsos }) => {
  const isMember = userRsos.some((userRso) => userRso.id === rso.id);

  return (
    <div className="rso-card">
      <h3>{rso.name}</h3>
      {isMember ? (
        <button onClick={() => handleLeave(rso)}>Leave</button>
      ) : (
        <button onClick={() => handleJoin(rso)}>Join</button>
      )}
    </div>
  );
};

const RsoPage = () => {
  const [rsos, setRsos] = useState([]);
  const [showCreateRsoForm, setShowCreateRsoForm] = useState(false);
  const [newRsoName, setNewRsoName] = useState('');
  const [newRsoMembers, setNewRsoMembers] = useState([]);
  const [error, setError] = useState('');
  const [userRsos, setUserRsos] = useState([]);
  const [refresh, setRefresh] = useState(false);

  function handleTokenChange(newToken)
  {
    localStorage.setItem('token', newToken);
    setRefresh(!refresh);
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/rsos/',{
        headers: {
          Authorization: token,
        },
        })
      .then((response) => response.json())
      .then((data) => {setRsos(data);})
      .catch((error) => console.error(error));
  }, [refresh]);

  const handleCreateRso = () => {
    const token = localStorage.getItem('token');
    if (newRsoMembers.length < 4) {
      setError('Error creating RSO: not enough members');
      return;
    }
    fetch('/api/rsos/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        name: newRsoName,
        members: newRsoMembers,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setRsos([...rsos, data]);
        setShowCreateRsoForm(!showCreateRsoForm);
        setNewRsoName('');
        setNewRsoMembers([]);
        setRefresh(!refresh);
        // Create notification
      fetch('/api/notifications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          type: 'RSO',
          rsoId: data.id,
        }),
      })
        .then((response) => response.json())
        .then((data) => {console.log(data);})
        .catch((error) => {
          console.error(error);
        });
      })
      .catch((error) => {
        console.error(error);
        setError('Error creating RSO. Make sure you enter 4 student emails.');
      });
  };

  const handleJoinRso = (rso) => {
    fetch(`/api/rsos/${rso.id}/members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setUserRsos([...userRsos, rso]);
        } else {
          throw new Error('Error joining RSO');
        }
      })
      .catch((error) => console.error(error));
  };

  const handleLeaveRso = (rso) => {
    fetch(`/api/rsos/${rso.id}/members`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setUserRsos(userRsos.filter((userRso) => userRso.id !== rso.id));
        } else {
          throw new Error('Error leaving RSO');
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="rso-page-container">
      <h1 className="rso-page-title">Registered Student Organizations (RSOs)</h1>
      {rsos === [] ? (
        <div className="no-rso-container">
          <p className="no-rso-message">No RSOs</p>
        </div>
      ) : (
        <div className="rso-cards-container">
        {rsos.filter((rso) => rso.status === 'ACTIVE').map((rso) => (
            <RSOCard
            key={rso.id}
            rso={rso}
            handleJoin={handleJoinRso}
            handleLeave={handleLeaveRso}
            userRsos={userRsos}
            />
        ))}
        </div>
      )}
      {(
        <div className="create-rso-container">
            {showCreateRsoForm === false ?
          <button className="create-rso-button" onClick={() => setShowCreateRsoForm(!showCreateRsoForm)}>
            Request RSO
          </button>
          :  <button className="create-rso-button" style={{backgroundColor: 'red'}} onClick={() => setShowCreateRsoForm(!showCreateRsoForm)}>
          Cancel
        </button>}
        </div>
      )}
      {showCreateRsoForm && (
        <div className="create-rso-form-container">
          <h2 className="create-rso-form-title">Create RSO</h2>
          <form onSubmit={(e) => e.preventDefault()} className="create-rso-form">
            <div className="create-rso-input-container">
              <label className="create-rso-label">
                Rso Name:
                <input
                  style={{marginLeft: "5px"}}
                  type="text"
                  value={newRsoName}
                  onChange={(e) => setNewRsoName(e.target.value)}
                  className="create-rso-input"
                />
              </label>
              <label className="create-rso-label" style={{marginLeft: "10px"}}>
                Member emails (seperate with commas):
                <input
                  style={{marginLeft: "5px"}}
                  type="text"
                  value={newRsoMembers}
                  onChange={(e) =>
                    setNewRsoMembers(e.target.value.split(','))
                  }
                  className="create-rso-input"
                />
              </label>
            </div>
            <button onClick={handleCreateRso} className="create-rso-submit-button">Submit</button>
            {error && <p className="create-rso-error-message" style={{color: 'red'}}>{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}

export default RsoPage;