import React, { useEffect, useState } from 'react';
import CommentCard from './CommentCard';
import './eventcardstyles.css';

const EventCard = ({ event, userId, handleJoinAPI, handleLeaveAPI }) => {

  const [commentRefresh, setCommentRefresh] = useState(false);
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);

  function callNewComments()  
  {
    setCommentRefresh(!commentRefresh);
  }
  const handleJoin = () => {
    handleJoinAPI(event.id);
  };

  const handleModal = () => {
    setShowCommentModal(!showCommentModal);
  };

  const handleLeave = () => {
    handleLeaveAPI(event.id);
  };

  const handleCancelComment = () => {
    setCommentText('');
    setRating(0);
    setShowCommentModal(false);
  };

  const handleSubmitComment = () => {

    const newBody = {
      text: commentText,
      eventId: event.id,
      rating: Number(rating)
    }

    fetch(`/api/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(newBody)
    })
    .then((response) => {
      if (response.status === 401) {
        throw new Error('Not authorized');
      }
      return response.json();
    })
    .then(() => {
      setCommentRefresh(!commentRefresh);
      handleCancelComment();
    })
    .catch((error) => {
        console.log(error.message);
        return;
    });
  };

  useEffect(() => {
    // Fetch the events data from the API
    fetch(`/api/comments/events/${event.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      })
      .then((response) => response.json())
      .then((data) => {setComments(data);})
      .catch((error) => console.error(error));
  }, [commentRefresh]);
  
  const isJoined = userId && event.attendees.some(attendee => attendee.id === userId);
  const time = event.startTime;
  const date = new Date(time);
  const formattedTime = date.toLocaleString();
  const endtime = event.endTime;
  const date2 = new Date(endtime);
  const formattedTime2 = date2.toLocaleString();


  return (
    <div className="new-card">
      <div className="new-card-body">
        <h5 className="new-card-title"><label style={{fontWeight: 'bold'}}>Event: </label>{event.name}</h5>
        <h5 className="new-card-title"><label style={{fontWeight: 'bold'}}>Location: </label>{event.location.name}</h5>
        <h5 className="new-card-title" style={{display: 'inline-block'}}><label style={{fontWeight: 'bold'}}>Category: </label>{event.category}</h5>
        <h6 className="new-card-subtitle mb-2 text-muted"><span style={{fontWeight: 'bold', display: 'inline-block', color:'black'}}>Start: </span>{formattedTime}<br></br><span style={{fontWeight: 'bold', display: 'inline', color:'black'}}>End: </span>{formattedTime2}</h6>
        <h5 className="new-card-title"><label style={{fontWeight: 'bold'}}>Host: </label>{event.host.firstName} {event.host.lastName}</h5>
        <p className="new-card-text">Member count: {event.attendees.length}</p>
        <p className="new-card-text">Description: </p><p className="new-card-text">{event.description}</p>
        <br></br>
        {isJoined ? (
          <button className="btn btn-danger" style={{color: 'white'}} onClick={handleLeave}>Leave</button>
        ) : (
          <button className="btn btn-primary" style={{color: 'white'}} onClick={handleJoin}>Join</button>
        )}
        <div className="mt-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Comments:</h4>
          </div>
          <div style={{ height: '150px', padding: '10px', overflowY: 'scroll', border: '3px solid black', borderRadius: '5px', scrollbarWidth: 'thin', scrollbarColor: 'grey'}}>
            {comments.length === 0 ? <div>No comments yet!</div> : comments.map(comment => <CommentCard key={comment.id} comment={comment} callRefresh={callNewComments}/>)}
          </div>
          {showCommentModal ? (
            <div style={{ marginTop: '20px' }}>
              <input type="text" className = 'commentbox' placeholder="Enter your comment" value={commentText} onChange={e => setCommentText(e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <span>Rating:</span>
                <input type="range" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} />
                <span>{rating}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-secondary" onClick={handleCancelComment}>Cancel</button>
                <button className="btn btn-primary ml-2" onClick={handleSubmitComment}>Submit</button>
              </div>
            </div>
          ): <div><button className="post-comment-button" onClick={handleModal}>Post comment</button></div>}
        </div>
      </div>
    </div>
  );
}  
export default EventCard;
