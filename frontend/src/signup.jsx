import { useEffect, useState } from "react";
import authorizedUsers from "./authorizedUsers"; // Import the users JSON
import "./signup.css";

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
        
        // Check if the user is already registered
        if (authorizedUsers.some((u) => u.email === user.email)) {
          alert("User already exists! Please log in.");
          return;
        }

        // Add new user to JSON
        authorizedUsers.push({ username: user.name, email: user.email, password: "google-auth" });
        console.log(authorizedUsers);
        alert("Signup successful using Google!");
      })
      .catch((err) => console.error("Failed to verify token", err));
  }

  function handleSignup(event) {
    event.preventDefault(); // Prevents form reload

    console.log("Signup clicked");
    console.log("Entered Email:", email);

    if (!email || !username || !password) {
      alert("Enter your Credentials");
      return;
    }

    if (authorizedUsers.some((user) => user.email === email)) {
      alert("User already exists! Please log in.");
      return;
    }

    authorizedUsers.push({ username, email, password });
    console.log("Updated authorizedUsers:", authorizedUsers);
    alert("Signup successful! You can now log in.");
  }


  return (
    <>
      <h1>Sign Up</h1>
      <form action="">
      <div className="block">
        <div className="input_info">
          <label>Username</label>
      
          <input
            required
            type="text"
            placeholder="Your Name"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input_info">
          <label>Email ID</label>
         
          <input
            required
            type="email"
            placeholder="Your email address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input_info">
          <label>Password</label>

          <input
          required
            type="password"
            placeholder="Create a password"
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
