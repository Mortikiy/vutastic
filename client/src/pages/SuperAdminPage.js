import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import './superAdminStyles.css';
import University from '../components/University';
import { useNavigate } from "react-router-dom";
import jwt_decode from 'jwt-decode';

function SuperAdminPage() {
    const navigate = useNavigate();
    const [buttons, setButtons] = useState(false);
    useEffect(() =>
    {
  
      let myToken = localStorage.getItem('token');
  
          // To login page if no token
          if (!myToken)
          {
              navigate('/');
              return;
          }  
          
          if (!jwt_decode(myToken).universityId)
              setButtons(false);
          else
              setButtons(true);

    }, []);

    const goUniv = () =>
    {
        navigate('/superadmin/university');
        return;
    }

    const goRSO = () =>
    {
      navigate('/superadmin/rso');
      return;
    }

    const goReq = () =>
    {
      navigate('/superadmin/requests');
      return;
    }

    const goEvent = () =>
    {
      navigate('/superadmin/events');
      return;
    }

    const signOut = () =>
    {
        localStorage.removeItem('token');
        navigate('/');
        return;
    }

  return (
    <div id="root">
    <div className="container">
        <h1>Super Admin Menu</h1>
        <br/>
      <button className="button" onClick={goUniv}>
        University Profile
      </button>
      {!buttons ? <></> : <>
      <button className="button" onClick={goReq}>
        Approve/Deny Request
      </button>
      <button className="button" onClick={goRSO}>
        RSOs
      </button>
      <button className="button" onClick={goEvent}>
        Events
      </button>
      <button  id="logoff" className="button" onClick={signOut}>
        Log out
      </button></>
       }
    </div>
    </div>
  );
}

export default SuperAdminPage;
