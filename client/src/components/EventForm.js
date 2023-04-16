import React, { useState, useEffect } from 'react';
import { LoadScript, useLoadScript, GoogleMap, MarkerF } from '@react-google-maps/api';
import { useNavigate } from "react-router-dom";
import jwt_decode from 'jwt-decode';
import './eventform.css';

const EventForm = ({callCancel, handleSuccess, callRefresh}) => {
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [eventType, setEventType] = useState("RSO");
  const [publicEvent, setPublicEvent] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [map, setMap] = useState(false);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [center, setCenter] = useState({
    lat: 28.5383, lng: -81.3792 
 });
 const handleSelectChange = (event) => 
    {
      setSelectedId(event.target.value);
    }
 useEffect(() =>{setLocation(center);setMap(true);}, []);
 useEffect(() => {
    const token = localStorage.getItem('token');
          // To login page if no token
          if (!token)
          {
              navigate('/');
              return;
          }
    fetch('/api/rsos/',{
        headers: {
          Authorization: token,
        },
        })
      .then((response) => response.json())
      .then((data) => {setOptions(data)})
      .catch((error) => console.error(error));
  }, []);

  const filteredRSOs = options.filter(rso => rso.adminId === jwt_decode(localStorage.getItem('token')).userId);


 const handleAddress = (event) => {
    event.preventDefault();
    const geocoder = new window.google.maps.Geocoder();
    const addressValue = address.trim();
    
    if (address) {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
          const locate = results[0].geometry.location;
          const addr = results[0].formatted_address;
          document.getElementById("errorMsg").innerHTML="";
          setLocation({ latitude: locate.lat(), longitude: locate.lng(), name: addr });
          setCenter({ lat: locate.lat(), lng: locate.lng() });
        } else {
          document.getElementById("errorMsg").innerHTML="Invalid address";
        }
      });
    } else {
      geocoder.geocode(location, (results, status) => {
        if (status === 'OK') {
          const addr = results[0].formatted_address;
          document.getElementById("errorMsg").innerHTML="";
          setLocation({ latitude: location.latitude, longitude: location.longitude, name: addr });
          setCenter({ lat: location.latitude, lng: location.longitude });
        } else {
          document.getElementById("errorMsg").innerHTML="Could not retrieve address for the provided location";
        }
      });
    }
  }
  
 const containerStyle = {
    width: '100%',
    height: '250px'
  };
  
  const handleMapClick = event => {
    setLocation({ latitude: event.latLng.lat(), longitude: event.latLng.lng() });
    setCenter({lat: event.latLng.lat(), lng: event.latLng.lng()});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!eventName || !selectedId || !category || !description || !startTime || !endTime || !location.longitude || !location.latitude || !contactPhone || !contactEmail || !eventType)
    {
      setErrorMessage('Please enter all fields.');
      return;
    }
      
    const newBody = {
      name: eventName,
      category: category,
      description: description,
      startTime: startTime,
      endTime: endTime,
      locationName: location.name,
      longitude: location.longitude,
      latitude: location.latitude,
      contactPhone: contactPhone,
      contactEmail: contactEmail,
      type: eventType
    }

    fetch(`/api/rsos/${selectedId}/events`, 
      {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBody),
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            setErrorMessage(data.error);
            return;
          });
        }
        return response.json();
      })
      .then(data =>
      {
        // Successful
        // If request to make public event, send notification
      const newSend = {
        type: 'EVENT',
        eventId: data.event.id,
      };
      if (publicEvent)
      {
        fetch('/api/notifications/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
          body: JSON.stringify(newSend),
        })
          .then((response) => response.json())
          .then((data) => {
          })
          .catch((error) => {
            console.error(error);
          });
      }
        callCancel();
      })
      .catch(error => {
        console.error('Error:', error);
      });
      handleSuccess();
      callRefresh();
  };
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCrFIHwRBR5zA5mtIUvbBSHzWWEmaZ5FtU'
  });


return (
    <div className="event-form">
      <><h2 style={{textAlign: 'center'}}>Create New Event</h2></>
      <form onSubmit={handleSubmit}>
        <label htmlFor="eventName">Event Name:</label>
        <input
          type="text"
          id="eventName"
          name="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <label htmlFor="category">Category:</label>
        <input
          type="text"
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label htmlFor="startTime">Start Time:</label>
        <input
          type="datetime-local"
          id="startTime"
          name="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <label htmlFor="endTime">End Time:</label>
        <input
          type="datetime-local"
          id="endTime"
          name="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
     <div>
    <div id="map-container">
    <label className="form-label">Location: </label>
    {!isLoaded ? <div>Loading...</div> :
      <GoogleMap
        center= {(location == null) ? center : location}
        mapContainerStyle={containerStyle}
        zoom={10}
        onClick={handleMapClick}
      >
      {<MarkerF position={center} />}
      </GoogleMap>}
    </div>
    {location && (
      <input
        type="text"
        id="location"
        name="location"
        value={location != null ? `${location.latitude},${location.longitude}` : ''}
        readOnly
      />
    )}
  </div>
<div>
<p>Or enter address (Street, City, Zip): </p> <input style={{display: "inline", width: "70%"}} type="text" value={address} id="address" name="address" onChange={(event) => setAddress(event.target.value)}></input>
<button id = "mapbutton" style ={{display: "inline", width: "25%", marginLeft: "5%"}} onClick={handleAddress}>Search Address</button>
<p id="errorMsg" style={{color: "red"}}></p>
</div>
        <label htmlFor="contactPhone">Contact Phone:</label>
        <input
          type="text"
          id="contactPhone"
          name="contactPhone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
        <label htmlFor="contactEmail">Contact Email:</label>
        <input
          type="email"
          id="contactEmail"
          name="contactEmail"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        <div className="event-type">
          <label htmlFor="eventType">Type of Event:</label>
          <select id="eventType" name="eventType" value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="RSO">RSO</option>
            <option value="PRIVATE">Private</option>
          </select>
          <label htmlFor="university" className="form-label">
              RSO:
            </label>
            <select style={{marginLeft: "10px"}} onChange={handleSelectChange}>
            <option value="">Select from your RSO(s)...</option>
              {filteredRSOs ? filteredRSOs.map(obj => (
                <option key = {obj.id} value = {obj.id}>{obj.name}</option>
              )) : <div>No options!</div>}
            </select>
        </div>
        <div className="public-event">
          <input type="checkbox" id="publicEvent" name="publicEvent" checked={publicEvent} onChange={(e) => setPublicEvent(e.target.checked)} />
          <label htmlFor="publicEvent">Request to Make Event Public</label>
        </div>
        <p id='bigerror' style={{color: 'red'}}>{errorMessage}</p>
        <div className="form-buttons">
          <button type='submit'>Create Event</button>
        </div>
      </form>
    </div>
  );
}
  export default EventForm;