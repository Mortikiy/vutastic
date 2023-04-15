import React, { useState } from 'react';
import jwt_decode from 'jwt-decode';
import './commentcards.css';

function CommentCard({ comment, callRefresh }) {
    const { text, author, rating } = comment;
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(text);
    const [editedRating, setEditedRating] = useState(rating);
    const currentUser = jwt_decode(localStorage.getItem('token'));
    const isCommentOwner = currentUser && currentUser.userId === author.id;
    // Determine full, half, and empty stars based on rating
    const fullStars = Math.floor(isEditing ? editedRating : rating);
    const halfStars = Math.ceil((isEditing ? editedRating : rating) - fullStars);
    const emptyStars = 5 - fullStars - halfStars;
  
    // Create an array of stars to display
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span className="star full" key={i}></span>);
    }
    for (let i = 0; i < halfStars; i++) {
      stars.push(<span className="star half" key={i + fullStars}></span>);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span className="star empty" key={i + fullStars + halfStars}></span>);
    }

    function handleDelete(commentId)
    {
      fetch(`/api/comments/${commentId}`, 
      {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error deleting');
        }
        return response.json();
      })
      .then(data =>
      {
        callRefresh();
      })
      .catch(error => {
        console.error('Error:', error);
      });
    };

    function handleEdit(commentId)
    {
      const newBody = {
        text: editedText,
        rating: Number(editedRating)
      }

      fetch(`/api/comments/${commentId}`, 
      {
        method: 'PUT',
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBody),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error saving');
        }
        return response.json();
      })
      .then(data =>
      {
        callRefresh();
        setIsEditing(false);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }

    return (
        <div className="comment-card">
            <div className="comment-header">
                <h3>{author.firstName}</h3>
                <div className="star-container">
                    {isEditing ? (
                        <>
                            <input
                                type="number"
                                value={editedRating}
                                min="0"
                                max="5"
                                step="1.0"
                                onChange={(event) => setEditedRating(parseInt(event.target.value))}
                            />
                            <br />
                        </>
                    ) : (
                        stars
                    )}
                </div>
            </div>
            {isEditing ? (
                <>
                    <textarea value={editedText} onChange={(event) => setEditedText(event.target.value)}></textarea>
                    <br />
                    <button className='savebutton' onClick={() => handleEdit(comment.id)}>Save</button>
                    <button className='cancelbutton' onClick={() => setIsEditing(false)}>Cancel</button>
                </>
            ) : (
                <p>{text}</p>
            )}
            {(isCommentOwner && comment.id) && (
                <div className="comment-actions">
                    <button className="comment-action delete" onClick={() => handleDelete(comment.id)}>Delete</button>
                    {isEditing ? <></>:
                    <button className="comment-action edit" onClick={() => setIsEditing(true)}>Edit</button>}
                </div>
            )}
        </div>
    );
}

export default CommentCard;
