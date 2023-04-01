import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./styles.css";

function Signup(props) {
    const [firstName, setfirstName] = useState("");
    const [lastName, setlastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [universityId, setSelectedId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [options, setOptions] = useState([]);
    const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    setConfirm(!confirm);
    }

    useEffect (() => {
      fetch('/api/universities/', {
        method: 'GET',
        headers:
        {
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data =>
        {
          setOptions(data);
        })
      .catch(error =>
      {
        console.log(error);
      });
   }, []);

    const handleClick = () => {
      props.handleFunction();
    };

    function passwordVerification()
    {
      setConfirmPassword(document.getElementById('confirm-password').value);
      setPassword(document.getElementById('password').value);
      let msg = document.getElementById('confirmMessage');

      if (document.getElementById('confirm-password').value === "" || document.getElementById('password').value === "")
      {
        msg.innerHTML="";
        return;
      }

      if (passwordsMatch())
      {
        msg.innerHTML="Passwords match!";
        msg.style.color="green";
      }

      else
      {
        msg.innerHTML="Passwords do not match.";
        msg.style.color="red";
      }
    };

   function passwordsMatch()
   {
    let password = document.getElementById("password").value;
	  let confirm = document.getElementById("confirm-password").value;

    // Check if passwords match or empty
    return (confirm === password && confirm !== "") ? true : false;
   }

   function verifyInfo()
    {
      let firstName = document.getElementById('firstName').value;
      let lastName = document.getElementById('lastName').value;
      let email = document.getElementById('email').value;
      let password = document.getElementById('password').value;

      // Disabling some goofy warnings for regex that react doesn't like

      // eslint-disable-next-line
	    let passRestriction = /(?=.*\d)(?=.*[A-Za-z])(?=.*[?!@#$%^&*]).{8,32}$/;
      // eslint-disable-next-line
	    let nameRestriction = /(?=.*[a-zA-Z])./;
      // eslint-disable-next-line
      let emailRestriction = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if (nameRestriction.test(firstName) === false || nameRestriction.test(lastName) === false)
		    return 1;

      else if (emailRestriction.test(email) === false)
        return 2;

      else if (passRestriction.test(password) === false)
        return 3;

      else if (!passwordsMatch())
        return 4;
      else if (universityId === "")
        return 404;
      return 5;
    }

    const handleSelectChange = (event) => 
    {
      setSelectedId(event.target.value);
    }

    const handleSubmit = (event) => {
      event.preventDefault();

      let signUpErrMsg = document.getElementById('signUpError');
      switch(verifyInfo())
      {
        case 1:
          {
            signUpErrMsg.innerHTML="Please enter a valid first/last name.";
            signUpErrMsg.style.color='red';
            return;
          }
        case 2:
          {
            signUpErrMsg.innerHTML="Please enter a valid email.";
            signUpErrMsg.style.color='red';
            return;
          }
        case 3:
          {
            signUpErrMsg.innerHTML="Your password must contain at least:<br>1 Uppercase & Lowercase letter<br>1 Symbol & 1 Digit";
            signUpErrMsg.style.color='red';
            return;
          }
        case 4:
          {
            signUpErrMsg.innerHTML="Your passwords do not match.";
            signUpErrMsg.style.color='red';
            return;
          }
        case 404:
          {
            signUpErrMsg.innerHTML="Please choose a";
            signUpErrMsg.style.color='red';
            return;
          }
        case 5:
          {
            // Continue to fetch
            ;
          }
      }

      const req = JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        universityId: Number(universityId)
      })
      // Sign up API here
      fetch('/api/register',
      {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
        },
        body: req
      })
      .then((response) =>
      {
        if (response === 409)
        {
          signUpErrMsg.innerHTML="An account with this email already exists.";
          signUpErrMsg.style.color='red';
          throw new Error ("User already exists");
        }

        else if (response === 404)
        {
          signUpErrMsg.innerHTML="University doesn't exist.";
          signUpErrMsg.style.color='red';
          throw new Error ("University not found");
        }

        return response.json();
      })
      .then(() =>
      {
          let signUpErrMsg = document.getElementById('signUpError');
          document.getElementById("signUpForm").querySelectorAll("input").forEach((input) => {
            input.value = "";
          });
          setEmail('');
          setfirstName('');
          setlastName('');
          setOptions('');
          passwordVerification();
          signUpErrMsg.innerHTML="New account made!";
          signUpErrMsg.style.color='green';
      })
      .catch((error) => 
      {
        // Silent handles
        if (error.message.includes("exists") || error.message.includes("not found"))
          return;
      });
    };
    return (
      <div className="form-container">
        <h1 className="form-title">Sign Up</h1>
        <form onSubmit={handleSubmit} className="form" id="signUpForm">
        <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First Name:
            </label>
            <input
              name = "firstname"
              placeholder="First Name"
              type="text"
              id="firstName"
              value={firstName}
              onChange={(event) => setfirstName(event.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Last Name:
            </label>
            <input
              name = "lastname"
              placeholder="Last Name"
              type="text"
              id="lastName"
              value={lastName}
              onChange={(event) => setlastName(event.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              name = "email"
              placeholder="Email"
              type="text"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="university" className="form-label">
              University:
            </label>
            <select onChange={handleSelectChange}>
            <option value="">Select an option...</option>
              {options.map(obj => (
                <option key = {obj.id} value = {obj.id}>{obj.description}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              name = "password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={passwordVerification}
              className="form-input"
            />
            <i onClick={togglePasswordVisibility}>
            {showPassword ?  <FaEye /> : <FaEyeSlash />}
            </i>
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">
              Confirm Password:
            </label>
            <input
              name = "confirm"
              placeholder="Confirm Password"
              type={confirm ? "text" : "password"}
              id="confirm-password"
              value={confirmPassword}
              onChange={passwordVerification}
              className="form-input"
            />
          <p id="confirmMessage"></p>
          </div>
          <button type="submit" className="form-button">
            Sign up!
          </button>
          <br></br>
          <p id="signUpError"></p>
          <p>Returning? <strong onClick={handleClick} style={{textDecoration: "underline", display: "inline", cursor: "pointer"}}>Log in.</strong></p>
        </form>
      </div>
    );
  }
export default Signup;
