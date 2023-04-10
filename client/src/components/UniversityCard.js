import React, { useState } from 'react';
import './unicardstyles.css';
const UniversityCard = ({ university, handleEdit, onTokenChange}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUniversity, setEditedUniversity] = useState(university);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedUniversity(university);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    handleEdit(editedUniversity);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedUniversity({
      ...editedUniversity,
      [name]: value,
    });
  };

  const handleDeleteClick = () => {
    handleDelete(university.id);
  };

  function handleDelete(id)
  {
    let myToken = localStorage.getItem('token');
    fetch(`/api/universities/${id}`,{
        method: 'DELETE',
        headers:
        {
          'Content-Type': 'application/json',
          'Authorization': myToken
        },
      })
    .then((response) =>
      {
        if (response.status === 401)
        {
            throw new Error('Not authorized');
        }
        return response.json();
      })
    .then((data) =>
    {
        onTokenChange(data);
    })
    .catch((error) => 
      {
        if (error.message.includes("silent"))
            return;
        console.log(error.message);
      });
  }

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
                onChange={handleInputChange}
              />
            ) : (
              university.name
            )}
          </h2>
          <p className="university-location">
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={editedUniversity.locationId}
                onChange={handleInputChange}
              />
            ) : (
              university.locationId
            )}
          </p>
          <p className="university-description">
            {isEditing ? (
              <textarea
                name="description"
                value={editedUniversity.description}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
};

export default UniversityCard;
