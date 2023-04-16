import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import EventForm from '../components/EventForm';
import './eventpagestyles.css';

function EventPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All');
  const [refresh, setRefresh] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false); // new state variable to control display of form
  let user = jwt_decode(localStorage.getItem('token'));

  function refreshData()
  {
    setRefresh(!refresh);
    setRefresh(!refresh);
  }
  function messageShowFunction()
  {
    setMessage('Success!');
    setTimeout(() => {
      setMessage('');
    }, 3000);
  }
  function handleShow(){
    setShowCreateForm(false);
  }
  useEffect(() => {
    let myToken = localStorage.getItem('token');
          // To login page if no token
          if (!myToken)
          {
              navigate('/');
              return;
          }

    // Fetch the events data from the API
    fetch('/api/events/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      })
      .then((response) => response.json())
      .then((data) => {setEvents(data); console.log(data);})
      .catch((error) => console.error(error));

    // Check if the current user is an admin or superadmin
    const decoded = jwt_decode(localStorage.getItem('token'));
    if (decoded.role != 'USER')
        setIsAdmin(true);
    else
        setIsAdmin(false);
  }, [refresh]);

  const handleCreateEvent = () => {
    setShowCreateForm(true); // show the form when the button is clicked
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleJoinAPI = (eventId) => {
    let token = localStorage.getItem('token');
    fetch(`/api/events/${eventId}/join`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => {
        if (response.ok) {
          setRefresh(!refresh);
        } else {
          throw new Error('Failed to join event.');
        }
      })
      .catch((error) => console.error(error));
  };

  const handleLeaveAPI = (eventId) => {
    let token = localStorage.getItem('token');
    fetch(`/api/events/${eventId}/leave`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => {
        if (response.ok) {
          setRefresh(!refresh);
        } else {
          throw new Error('Failed to leave event.');
        }
      })
      .catch((error) => console.error(error));
  };
  
  const filteredEvents = events.filter((event) => {
    if (filter === 'All') {
      return true;
    } else if (filter === 'RSO') {
      return event.type === 'RSO';
    } else if (filter === 'Private') {
      return event.type === 'PRIVATE';
    } else if (filter === 'Public') {
      return event.type === 'PUBLIC';
    }
    return false;
  });

  return (
    <div className="event-page">
      {isAdmin && (
        <>
        {!showCreateForm ? <button className="button-create-event" onClick={() => setShowCreateForm(true)}>
          Create Event
        </button> : <><br></br><button id='cancelbutton' onClick={() => setShowCreateForm(false)}>Cancel</button><br></br></>}
        </>
      )}
      {showCreateForm ? (
        <div className="create-event-form">
          <EventForm callCancel={handleShow} handleSuccess={messageShowFunction} callRefresh={refreshData}/>
          <br></br>
        </div>
      ) : (
        <>
        <div className="filter-section">
        <label htmlFor="filter">Filter by:</label>
        <select id="filter" value={filter} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="RSO">RSO</option>
          <option value="Private">Private</option>
          <option value="Public">Public</option>
        </select>
      </div>
        <div className="events-container">
          {filteredEvents.length === 0 ? (
            <div>No events to display!</div>
          ) : (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                handleLeaveAPI={handleLeaveAPI}
                handleJoinAPI={handleJoinAPI}
                userId={user.userId}
              />
            ))
          )}
        </div>
        <p style={{color: 'green', fontSize: '2em'}}>{message}</p>
        </>
      )}
    </div>
  );
  
}

export default EventPage;

