import React, { useState, useEffect } from 'react';
import { LoadScript, useLoadScript, GoogleMap, MarkerF } from '@react-google-maps/api';
import { useNavigate } from "react-router-dom";
import jwt_decode from 'jwt-decode';

function CreateUniversity(props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [numStudents, setNumStudents] = useState('');
  const [picture, setPicture] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [url, setUrl] = useState('');
  const [center, setCenter] = useState({
    lat: 28.5383, lng: -81.3792 
 });


  const handleMapClick = event => {
    setLocation({ latitude: event.latLng.lat(), longitude: event.latLng.lng() });
    setCenter({lat: event.latLng.lat(), lng: event.latLng.lng()});
  };
  const handlePictureChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const containerStyle = {
    width: '100%',
    height: '250px'
  };

  const navigate = useNavigate();

  let myToken = localStorage.getItem('token');
  if (!myToken)
        {
            navigate('/');
            return;
        }
    const user = jwt_decode(myToken);

  const handleAddress = (event) =>
  {
      event.preventDefault();
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') 
      {
        const locate = results[0].geometry.location;
        document.getElementById("errorMsg").innerHTML="";
        setLocation({ latitude: locate.lat(), longitude: locate.lng() });
        setCenter({lat: locate.lat(), lng: locate.lng()});
      }
      else
      {
        document.getElementById("errorMsg").innerHTML="Invalid address";
      }
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const universityData = JSON.stringify({ 
      name,
      location,
      description,
      numStudents: Number(numStudents),
      url,
    });

    // Send universityData to API endpoint
    fetch('/api/universities/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': myToken
      },
      body: universityData,
    })
      .then((response) =>
      {
        if (response.status === 409)
        {
            document.getElementById("errmsgg").innerHTML="University already exists at this location!"; 
            document.getElementById("errmsgg").style.color="red";
            throw new Error('exists');
        }

        else if(response.status === 401)
        {
            document.getElementById("errmsgg").innerHTML="You are not authorized to do this!"; 
            document.getElementById("errmsgg").style.color="red";
            throw new Error('exists');
        }
        return response.json();
      })
      .then((data) =>
      {
        // Sucess, refresh page
        props.onTokenChange(data.token);
      })
      .catch((error) => 
      {
        // Silent handle
        if (error.message.includes("exists"))
          return;
      });
      
  };

  return (
    <div>
        <br/><br/>
    <div className="form-container" style={{maxHeight: "900px"}}>
      <h2 className="form-title">Create University</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Name
          </label>
          <input
            className="form-input"
            type="text"
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <LoadScript
        googleMapsApiKey="AIzaSyCrFIHwRBR5zA5mtIUvbBSHzWWEmaZ5FtU"
        libraries={["places"]}
        >
     <div>
    <div id="map-container">
    <label className="form-label">Location: </label>
      <GoogleMap
        center= {(location == null) ? center : location}
        mapContainerStyle={containerStyle}
        zoom={10}
        onClick={handleMapClick}
      >
      {<MarkerF position={center} />}
      </GoogleMap>
    </div>
    {location && (
      <input
        type="text"
        id="location"
        name="location"
        value={`${location.latitude},${location.longitude}`}
        readOnly
      />
    )}
  </div>
</LoadScript>
<div>
<p>Or enter address (Street, City, Zip): </p> <input style={{display: "inline", width: "70%"}} type="text" value={address} id="address" name="address" onChange={(event) => setAddress(event.target.value)}></input>
<button id = "mapbutton" style ={{display: "inline", width: "25%", marginLeft: "5%"}} onClick={handleAddress}>Search Address</button>
<p id="errorMsg" style={{color: "red"}}></p>
</div>
        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            className="form-input"
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="numStudents">
            Number of Students
          </label>
          <input
            className="form-input"
            type="number"
            id="numStudents"
            value={numStudents}
            onChange={(event) => setNumStudents(Number(event.target.value))}
          />
        </div>
        <div className="form-group" style={{marginBottom: "5px"}}>
          <label className="form-label" htmlFor="picture">
            Picture URL:
          </label>
          <input style={{marginLeft: "10px", width: "70%"}}
            type="text"
            id="picture"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>
        <p id="errmsgg" style={{marginBottom: "5px"}}></p>
        <button className="form-button" type="submit">
          Create
        </button>
      </form>
    </div>
    </div>
  );
}

export default CreateUniversity;
