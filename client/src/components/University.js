import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import jwt_decode from 'jwt-decode';
import CreateUniversity from './CreateUniversity';
import UniversityCard from './UniversityCard';
function University()
{
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const msg = "test!";
    const [myToken, setMyToken] = useState(localStorage.getItem('token'))

  function handleTokenChange(newToken)
  {
    setMyToken(newToken);
    localStorage.setItem('token', newToken);
  }

  useEffect(() =>
  {
        console.log(myToken);
        // To login page if no token
        if (!myToken)
        {
            navigate('/');
            return;
        }
    let decodedUniId = jwt_decode(myToken).universityId;
    console.log(jwt_decode(myToken));
    if (!decodedUniId)
    {
      decodedUniId = -1;
    }
    
    fetch(`/api/universities/${decodedUniId}`,{
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
            // Leave show true to show University Create
            setShow(true);
            throw new Error('silent');
        }
        return response.json();
      })
    .then((data) =>
    {
        // Show form page or university page depending on if owned
        if (data === null)
          setShow(true);
        else
          setShow(false);
    })
    .catch((error) => 
      {
        if (error.message.includes("silent"))
            return;
      });
  }, [myToken]);


    return (
        <div>
        {show && <CreateUniversity onTokenChange={handleTokenChange}/> || <UniversityCard />}
        </div>
    );
}

export default University;