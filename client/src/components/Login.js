import React, { useState } from "react";
import "./styles.css";

function Login(props) 
{
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
   
  const handleClick2 = () => {
    props.handleFunction2();
  };

  function verifyLogin()
  {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    // eslint-disable-next-line
    let emailRestriction = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (email == null || password == null || email == "" || password == "")
      return 0;

    else if (emailRestriction.test(email) == false)
      return 1;
    else
      return 200;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const errmsg = document.getElementById('logInError');

    switch(verifyLogin())
        {
          case 0:
            {
              errmsg.innerHTML="Please enter all fields.";
              return;
            }
          case 1:
            {
              errmsg.innerHTML="Please enter a valid email address.";
              return;
            }
          case 200:
            {
              // Continue to fetch
              ;
            }
        }

    fetch('/api/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) =>
      {
        if (response.status === 401)
        {
            errmsg.innerHTML="Incorrect/invalid combination."; 
            throw new Error('Invalid login');
        }
        return response.json();
      })
      .then((data) =>
      {
          // Just display JWT for now
          alert("Hello, "+data.token);

        // Here is where we do something with the response data our call gives us (nothing for login besides a cookie maybe)
      })
      .catch((error) => 
      {
        // Silent handle
        if (error.message.includes("login"))
          return;
      });
};

  return (
    <div className="form-container">
      <h1 className="form-title">Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
          Email:
          </label>
          <input
            placeholder="Email"
            type="text"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group" id="labelpass" >
          <label htmlFor="password" className="form-label">
            Password:
          </label>
          <input
            placeholder="Password"
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="form-input"
          />
        </div>
        <button type="submit" className="form-button">
          Log in
        </button>
        <br></br>
        <p id="logInError"></p>
        <p>New here? <strong onClick={handleClick2} style={{textDecoration: "underline", display: "inline", cursor: "pointer"}}>Sign up!</strong></p>
      </form>
    </div>
  );
}

export default Login;
