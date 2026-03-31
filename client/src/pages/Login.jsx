import React, { useState } from "react";
import axios from "axios";

function Login({ setUser }) {

  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    year: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 LOGIN
  const login = async () => {
    try {
      const res = await axios.post("http://localhost:3000/login", {
        email: form.email
      });

      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("name", res.data.name);

      setUser(res.data.user_id);

    } catch (err) {
      alert("User not found");
    }
  };

  // 🔥 REGISTER
  const register = async () => {
    try {
      await axios.post("http://localhost:3000/users", form);
      alert("Registered! Now login.");
      setIsLogin(true); // switch to login
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login">
    <h1 className="title">Skill Based Project Partner Finder</h1>
    <h2 style={{textAlign:"center",marginBottom:"50px"}}>SkillSync</h2>
    <div className="card-login">
      

      <h2>{isLogin ? "Login" : "Register"}</h2>

      {!isLogin && (
        <>
          <input name="first_name" placeholder="First Name" onChange={handleChange} />
          <input name="last_name" placeholder="Last Name" onChange={handleChange} />
          <input name="department" placeholder="Department" onChange={handleChange} />
          <input name="year" placeholder="Year" onChange={handleChange} />
          <input
            name="skills"
            placeholder="Enter skills (comma separated e.g. Python-Intermediate,React-Advanced)"
            onChange={handleChange}
            />
        </>
      )}

      <input name="email" placeholder="Email" onChange={handleChange} />

      <div className="btn-group">
      <button onClick={isLogin ? login : register}>
        {isLogin ? "Login" : "Register"}
      </button>
      </div>
      <p
        style={{ cursor: "pointer", marginTop: "10px" }}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? <p className="lr">Don't have an account? <span className="underline">Register</span></p>
          : <p className="lr">Already have an account? <span className="underline">Login</span></p>}
      </p>

    </div>
    </div>
  );
}

export default Login;