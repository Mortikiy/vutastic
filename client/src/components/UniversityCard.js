import React, { useState } from 'react';
import './unicardstyles.css';
import jwt_decode from 'jwt-decode';

const UniversityCard = ({ university, onTokenChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUniversity, setEditedUniversity] = useState(university);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedUniversity(university);
  };

  const handleNameChange = (event) => {
    const { value } = event.target;
    setEditedUniversity({
      ...editedUniversity,
      name: value,
    });
  };  

  const handleDescriptionChange = (event) => {
    const { value } = event.target;
    setEditedUniversity({
      ...editedUniversity,
      description: value,
    });
  };  
  const handleSaveClick = () => {
    setIsEditing(false);
    fetch(`/api/universities/${editedUniversity.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(editedUniversity),
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error('Not authorized');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        onTokenChange(data.token);
      })
      .catch((error) => {
        if (error.message.includes('authorized')) return;
      });
  };

  const handleDeleteClick = () => {
    handleDelete(university.id);
  };

  function handleDelete(id) {
    let myToken = localStorage.getItem('token');
    fetch(`/api/universities/${id}`, {
      method: 'DELETE',
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
        onTokenChange(data.token);
      })
      .catch((error) => {
        if (error.message.includes('silent')) return;
        console.log(error.message);
      });
  }

  const handleNumChange = (event) => {
    const { name, value } = event.target;
    setEditedUniversity({
      ...editedUniversity,
      [name]: parseInt(value, 10),
    });
  };
  
  const handleLocationChange = (event) => {
    const { name, value } = event.target;
    setEditedUniversity((prevUniversity) => ({
      ...prevUniversity,
      location: {
        ...prevUniversity.location,
        [name.split('.')[1]]: parseFloat(value),
      },
    }));
  };
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "location.name") {
      setEditedUniversity({
        ...editedUniversity,
        location: {
          ...editedUniversity.location,
          name: value
        }
      });
    } else if (name.endsWith(".latitude") || name.endsWith(".longitude")) {
      handleLocationChange(event);
    } else {
      setEditedUniversity({
        ...editedUniversity,
        location: {
          ...editedUniversity.location,
          [name.split(".")[1]]: value
        }
      });
    }
  };
  
  
  

  return (
    <div className="university-card-container">
      <div className="university-card">
        <div className="university-picture">
          <img src={university.picture} alt={university.name} />
        </div>
        <div className="university-info">
          <h2 className="university-name">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedUniversity.name}
                onChange={handleNameChange}
              />
            ) : (
              university.name
            )}
          </h2>
          <p className="university-location">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="location.name"
                  value={editedUniversity.location.name}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  step="0.0001"
                  name="location.latitude"
                  value={editedUniversity.location.latitude}
                  onChange={handleLocationChange}
                />
                <input
                  type="number"
                  step="0.0001"
                  name="location.longitude"
                  value={editedUniversity.location.longitude}
                  onChange={handleLocationChange}
                />
              </>
            ) : (
              <>{university.location.name}<br></br>Latitude: {university.location.latitude}<br></br>{' '}
              Longitude: {university.location.longitude}
              </>
            )}
          </p>
          <br></br>
          <p className="university-description">
            {isEditing ? (
              <textarea
                name="description"
                value={editedUniversity.description}
                onChange={handleDescriptionChange}
              />
            ) : (
              university.description
            )}
          </p>
          <p className="university-students">
            Number of students:{' '}
            {isEditing ? (
              <input
                type="number"
                name="numStudents"
                value={editedUniversity.numStudents}
                onChange={handleNumChange}
              />
            ) : (
              university.numStudents
            )}
          </p>
          <div className="university-buttons">
            {isEditing ? (
              <>
                <button className="university-button" onClick={handleSaveClick}>
                  Save
                </button>
                <button className="university-button" onClick={handleCancelClick}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="university-button" onClick={handleEditClick}>
                  Edit
                </button>
                <button className="university-button" onClick={handleDeleteClick}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UniversityCard;