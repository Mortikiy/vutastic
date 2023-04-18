import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './requests.css';

function Requests() {
  const [notifications, setNotifications] = useState([]);
  const [myToken, setMyToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();
  useEffect(() => {

    // To login page if no token
    if (!myToken)
    {
        navigate('/');
        return;
    }

    async function fetchNotifications() {
        fetch(`/api/notifications/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: myToken,
            },
          })
            .then((response) => {
              if (response.status === 401) {
                throw new Error('Not authorized');
              }
              return response.json();
            })
            .then((data) => {
              setNotifications(data);
            })
            .catch((error) => {
              if (error.message.includes('authorized'))
                console.log(error.message);
                return;
            });
    }
    fetchNotifications();
  }, []);

  function handleAccept(notificationId) {
    fetch(`/api/notifications/${notificationId}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: myToken,
      },
    })
    .then((response) => {
      if (response.status === 401) {
        throw new Error('Not authorized');
      }
      return response.json();
    })
    .then((data) => {
      // Update the notifications list by filtering out the accepted notification
      setNotifications((prevNotifications) => prevNotifications.filter(notification => notification.id !== notificationId));
      console.log(data);
    })
    .catch((error) => {
        console.log(error.message);
        return;
    });
  }
  

  function handleDecline(notificationId) {
    fetch(`/api/notifications/${notificationId}/decline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: myToken,
        },
      })
      .then((response) => {
        if (response.status === 401) {
          throw new Error('Not authorized');
        }
        return response.json();
      })
      .then((data) => {
        // Update the notifications list by filtering out the accepted notification
        setNotifications((prevNotifications) => prevNotifications.filter(notification => notification.id !== notificationId));
        console.log(data);
      })
      .catch((error) => {
          console.log(error.message);
          return;
      });
  }

  return (
    <div>
      <h1>Requests</h1>
      <br></br>
      {notifications.length <= 0 ? <div>No current requests!</div> :
      notifications.map((notification) => (
        <div key={notification.id} className="card">
          <div className="card-body">
            <h5 className="card-title">Type: {notification.type}</h5>
            <p className="card-text">Name: {notification.type === 'RSO' ? notification.rso.name : notification.event.name}</p>
            <p className="card-text">Members: {notification.type === 'RSO' ? (notification.rso.members.map((item) => (item.firstName + ' ' + item.lastName + ' '))) : notification.event.host.firstName + notification.event.host.lastName}</p>
            <button onClick={() => handleAccept(notification.id)} className="btn btn-success">Accept</button>
            <button onClick={() => handleDecline(notification.id)} className="btn btn-danger">Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Requests;
