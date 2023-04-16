import React, { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import './rsostyles.css';

const RSOCard = ({ rso, handleJoin, handleLeave, handleTransferOwnership, userRsos, transferError, userId}) => {
    const isMember = userRsos.findIndex((member) => member.id === userId) !== -1;
    const isCurrentUserAdmin = rso.adminId === userId;
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const error = transferError;

    const handleInputChange = (e) => {
      setNewAdminEmail(e.target.value);
    };
  
    const handleTransferOwnershipClick = () => {
      handleTransferOwnership(rso.id, newAdminEmail);
    };
  
    return (
      <div className="rso-card">
        <h3>{rso.name}</h3>
        <h4>Number of members: {rso.members.length}</h4>
        <h4>Admin: {rso.admin.firstName}</h4>
        <h5 style={{marginTop: '5px'}}>Status: {rso.status}</h5>
        <br></br>
        {isCurrentUserAdmin ? (
          <div>
            <label htmlFor="new-admin-email">New Admin Email: </label>
            <input type="email" id="new-admin-email" value={newAdminEmail} onChange={handleInputChange} />
            <button style={{backgroundColor: 'lime'}} onClick={handleTransferOwnershipClick}>Transfer Ownership</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        ) : (
          isMember && (
            <button style={{ backgroundColor: 'red' }} onClick={() => handleLeave(rso)}>
              Leave
            </button>
          ) || (
            <button onClick={() => handleJoin(rso)}>
              Join
            </button>
          )
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
  const [message, setMessage] = useState('');
  const [errorBoxId, setErrorBoxId] = useState();
  const [transferError, setTransferError] = useState();
  const [token, setToken] = useState(jwt_decode(localStorage.getItem('token')));
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
      .then((data) => {setRsos(data)})
      .catch((error) => console.error(error));
  }, [refresh]);

  const handleCreateRso = () => {
    const token = localStorage.getItem('token');
    // Strip spaces from members' email addresses
    const strippedMembers = newRsoMembers.map((member) => member.trim());
    if (strippedMembers.length < 4) {
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
        members: strippedMembers,
      }),
    })
      .then((response) =>{
        if (response.status == 409)
        {
            setError('RSO name taken.');
                throw new Error('silent');
        }
        else if (!response.ok)
        {
            setError('Please enter 4 student emails to request RSO.');
                throw new Error('silent');
        }
        return response.json();
      })
      .then((rso) => {
        setRsos([...rsos, rso]);
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
            rsoId: rso.id,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        if (error.message.includes("silent"))
            return;
        console.error(error);
        setError('Error creating RSO. Make sure you enter 4 student emails.');
      });

        setMessage('Successful request!');
        setTimeout(() => {
          setMessage('');
        }, 3000);
  };
  
  const handleJoinRso = (rso) => {
    fetch(`/api/rsos/${rso.id}/join`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    })
      .then((response) => {
        if (response.ok) {
          setUserRsos([...userRsos, rso]);
          setRefresh(!refresh);
        } else {
          throw new Error('Error joining RSO');
        }
      })
      .catch((error) => console.error(error));
};


  const handleLeaveRso = (rso) => {
    fetch(`/api/rsos/${rso.id}/leave`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    })
      .then((response) => {
        if (response.ok) {
          setUserRsos(userRsos.filter((userRso) => userRso.id !== rso.id));
          setRefresh(!refresh);
        } else {
          throw new Error('Error leaving RSO');
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTransferOwnership = async (rsoId, newAdminEmail) => {
    try {
      const response = await fetch(`/api/rsos/${rsoId}/transfer-ownership`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({ newAdminEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        // Ownership transferred successfully, do something here
        setRefresh(!refresh);
        setTimeout(() => {
            setError('');
          }, 3000);
      } else {
        // Error transferring ownership, display error message
        setTransferError(data.error);
        setErrorBoxId(rsoId);
      }
    } catch (error) {
      console.error(error);
      // Handle network error here
    }
  };
  

  return (
    <div className="rso-page-container">
      <h1 className="rso-page-title" style={{textAlign: 'center'}}>Registered Student Organizations (RSOs)</h1>
      {rsos.length <= 0 ? (
        <div className="no-rso-container">
          <h3 className="no-rso-message">No RSOs</h3>
        </div>
      ) : (
        <div className="rso-cards-container">
        {rsos.map((rso) => (
            <RSOCard
            key={rso.id}
            rso={rso}
            handleJoin={handleJoinRso}
            handleLeave={handleLeaveRso}
            userRsos={rso.members}
            handleTransferOwnership={handleTransferOwnership}
            transferError={rso.id === errorBoxId ? transferError : null}
            userId={token.userId}
            />
        ))}
        </div>
      )}
      {(
        <div className="create-rso-container">
            {showCreateRsoForm === false ?<div>
          <button className="create-rso-button" onClick={() => setShowCreateRsoForm(!showCreateRsoForm)}>
            Request RSO
          </button>
          <p style={{color: 'green', display: 'block'}}>{message}</p></div>
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
                4 Student member emails (seperate with commas):
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
      <br></br><br></br>
    </div>
  );
}

export default RsoPage;