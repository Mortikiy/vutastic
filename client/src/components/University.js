import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import jwt_decode from 'jwt-decode';
import CreateUniversity from './CreateUniversity';
function University()
{
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const msg = "test!";
  useEffect(() =>
  {

    let myToken = localStorage.getItem('token');

        // To login page if no token
        if (!myToken)
        {
            navigate('/');
            return;
        }
    const id = jwt_decode(myToken).userId;
    
    fetch(`api/universities/${id}`,{
        method: 'GET',
        headers:
        {
          'Content-Type': 'application/json',
        },
      })
    .then((response) =>
      {
        if (response.status === 404)
        {
            // Leave show false to show University Component
            setShow(true);
            throw new Error('silent');
        }
        return response.json();
      })
    .then((data) =>
    {
        setShow(true);
    })
    .catch((error) => 
      {
        if (error.message.includes("silent"))
            return;
      });
  }, []);


    return (
        <div>
        {show && <CreateUniversity/> || msg}
        </div>
    );
}

export default University;