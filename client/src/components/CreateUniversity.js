import React, { useState } from 'react';
import { LoadScript, useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

function CreateUniversity() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [numStudents, setNumStudents] = useState('');
  const [picture, setPicture] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const handleMapClick = event => {
    setLocation({ latitude: event.latLng.lat(), longitude: event.latLng.lng() });
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
  
  const center = {
     lat: 28.5383, lng: -81.3792 
  };

  function handleAddress()
  {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') 
      {
        const locate = results[0].geometry.location;
        if (locate === null)
        {
          document.getElementById("errorMsg").innerHTML="Invalid address";
          return;
        }
        document.getElementById("errorMsg").innerHTML="";
        setLocation({ latitude: locate.lat(), longitude: locate.lng() });
        console.log(location)
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
      numStudents,
      picture,
    });

    /*
    // Send universityData to API endpoint
    fetch('/api/universities/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: universityData,
    })
      .then((response) =>
      {
        if (response.status === 409)
        {
            document.querySelector("errmsgg").innerHTML="University already exists at this location!"; 
            throw new Error('exists');
        }
        return response.json();
      })
      .then((data) =>
      {
        console.log(data);
      })
      .catch((error) => 
      {
        // Silent handle
        if (error.message.includes("exists"))
          return;
      });
      */

  
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
        zoom={12}
        onClick={handleMapClick}
      >
      <Marker position={location} />
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
            onChange={(event) => setNumStudents(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="picture">
            Picture:
          </label>
          <input style={{marginLeft: "10px"}}
            type="file"
            id="picture"
            accept="image/*"
            onChange={handlePictureChange}
          />
        </div>
        <p id="logInErr" className='errmsgg'></p>
        <button className="form-button" type="submit">
          Create
        </button>
      </form>
    </div>
    </div>
  );
}

export default CreateUniversity;
