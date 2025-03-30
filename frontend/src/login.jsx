import { useState, useEffect } from "react";
import authorizedUsers from "./authorizedUsers";
import "./login.css";

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
        const foundUser = authorizedUsers.find((u) => u.email === user.email);
        if (foundUser) {
          alert(`Welcome back, ${foundUser.username}!`);
        } else {
          alert("User not found. Redirecting to Sign Up.");
          switchToSignup();
        }
      })
      .catch((err) => console.error("Failed to verify token", err));
  }

  function handleLogin() {
    event.preventDefault(); // Prevents form reload

    console.log("Entered Email:", email);
    console.log("Entered password:", password);
    if(email==="" || password==="")
    {
        alert("Enter your Credentials");
      
    }
    else{
   
    const user = authorizedUsers.find((u) => u.email === email && u.password == password);
    const userg = authorizedUsers.find((u) => u.email === email && u.password === "google-auth");
    if (user) {
      alert(`Welcome back, ${user.username}!`);
    }else if(userg){
       authorizedUsers.forEach(u=>
       {
        if(u.email==email && u.password==="google-auth")
        {
            u.password=password;
        }
       }
       )
       alert(`Welcome back, ${userg.username}!`);

    } 
    else {
      alert("User not found. Redirecting to Sign Up.");
      switchToSignup();
    }
          
}
  }

  return (
    <>
      <h1>Login</h1>
      <form action="">
      <div className="block">
        <div className="input_info">
          <label>Email ID</label>
        
          <input required type="email" placeholder="Your email address" onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input_info">
          <label>Password</label>
          
          <input required type="password" placeholder="Your password" onChange={(e) => setPassword(e.target.value)} />
        </div>
        
        <button className="submit_login" onClick={handleLogin}>Continue</button>
        
        <div className="or-line"><span>OR</span></div>
        <div id="google-login"></div>
      </div>
      </form>
    </>
  );
}
