import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import './superAdminStyles.css';
import University from '../components/University';
import { useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();

    useEffect(() =>
    {
  
      let myToken = localStorage.getItem('token');
  
          // To login page if no token
          if (!myToken)
          {
              navigate('/');
              return;
          }
    }, []);

    const goRSO = () =>
    {
      navigate('/student/rso');
      return;
    }

    const signOut = () =>
    {
        localStorage.removeItem('token');
        navigate('/');
        return;
    }
    const goEvent = () =>
    {
      navigate('/student/events');
      return;
    }

  return (
    <div id="root">
    <div className="container">
        <h1>Student Menu</h1>
        <br/>
      <button className="button" onClick={goRSO}>
        RSOs
      </button>
      <button className="button" onClick={goEvent}>
        Events
      </button>
      <button  id="logoff" className="button" onClick={signOut}>
        Log out
      </button>

    </div>
    </div>
  );
}

export default HomePage;
