import { useEffect, useState } from "react";
import "./signup.css";
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    /* Load Google Sign-In */
    window.google.accounts.id.initialize({
      client_id: "169492076098-sch0jg8ua4bn8qr2pjth6hndsh6a91ei.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(document.getElementById("google-login"), {
      theme: "outline",
      size: "large",
      text: "signup_with",
    });
  }, []);

  function handleCredentialResponse(response) {
    console.log("Google ID Token:", response.credential);

    fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${response.credential}`)
      .then((res) => res.json())
      .then((user) => {
        console.log("User Info:", user);
        
        fetch(`${API_URL}/signup/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: user.name, email: user.email }),
        })
        .then(res => {
          if (!res.ok) {
            return res.json().then(data => Promise.reject(data));
          }
          return res.json();
        })
        .then(data => {
          toast.success(data.message);
        })
        .catch(err => {
          toast.error(err.message || "Failed to register with Google");
          console.error("Failed to register user", err);
        });
      })
      .catch((err) => {
        toast.error("Failed to verify Google token");
        console.error("Failed to verify token", err);
      });
  }

  // Add validation function
  const validateInputs = () => {
    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Username validation (at least 3 characters, no special characters)
    if (username.length < 3 || /[^a-zA-Z0-9 ]/.test(username)) {
      toast.error("Username must be at least 3 characters long and contain only letters, numbers and spaces");
      return false;
    }

    // Password validation (at least 6 characters)
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  function handleSignup(event) {
    event.preventDefault();

    if (!email || !username || !password) {
      toast.warning("Please enter all credentials");
      return;
    }

    // Add validation check
    if (!validateInputs()) {
      return;
    }

    fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => Promise.reject(data));
      }
      return res.json();
    })
    .then(data => {
      toast.success(data.message);
    })
    .catch(err => {
      toast.error(err.message || "Failed to register");
      console.error("Failed to register user", err);
    });
  }


  return (
    <>
      <h1>Sign Up</h1>
      <form action="">
      <div className="block">
        <div className="input_info">
          <label>Username</label>
          <input
            type="text"
            placeholder="Your Name (min. 3 characters)"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input_info">
          <label>Email ID</label>
          <input
            type="text"
            placeholder="Your email address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input_info">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password (min. 6 characters)"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="submit_login" onClick={handleSignup}>
          Create an Account
        </button>

        {/* OR Divider */}
        <div className="or-line">
          <span>or</span>
        </div>

        {/* Google Sign-Up Button */}
        <div id="google-login"></div>
      </div>
      </form>
    </>
  );
}
