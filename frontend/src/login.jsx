import { useState, useEffect } from "react";
import "./login.css";
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

export default function Login({ switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: "169492076098-sch0jg8ua4bn8qr2pjth6hndsh6a91ei.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("google-login"),
      { theme: "outline", size: "large" }
    );
  }, []);

  function handleCredentialResponse(response) {
    fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${response.credential}`)
      .then((res) => res.json())
      .then((user) => {
        fetch(`${API_URL}/login/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        })
        .then(async res => {
          if (!res.ok) {
            const data = await res.json();
            return await Promise.reject(data);
          }
          return res.json();
        })
        .then(data => {
          toast.success(`Welcome back, ${data.username}!`);
        })
        .catch(err => {
          if (err.message === "User not found") {
            toast.info("User not found. Redirecting to Sign Up.");
            switchToSignup();
          } else {
            toast.error(err.message || "Failed to login with Google");
          }
          console.error("Failed to login", err);
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

    // Basic password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  function handleLogin(event) {
    event.preventDefault();

    if (!email || !password) {
      toast.warning("Please enter your credentials");
      return;
    }

    // Add validation check
    if (!validateInputs()) {
      return;
    }

    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    .then(async res => {
      if (!res.ok) {
        const data = await res.json();
        return await Promise.reject(data);
      }
      return res.json();
    })
    .then(data => {
      toast.success(`Welcome back, ${data.username}!`);
    })
    .catch(err => {
      toast.error(err.message || "Invalid credentials");
      if (err.message === "User not found") {
        switchToSignup();
      }
      console.error("Failed to login", err);
    });
  }

  return (
    <>
      <h1>Login</h1>
      <form action="">
      <div className="block">
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
            placeholder="Your password" 
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button className="submit_login" onClick={handleLogin}>Continue</button>
        
        <div className="or-line"><span>OR</span></div>
        <div id="google-login"></div>
      </div>
      </form>
    </>
  );
}
