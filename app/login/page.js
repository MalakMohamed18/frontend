"use client";

import { useState } from "react";
import Navbar from "../component/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateKeyPair } from "../../services/crypto"; 
import "../globals.css"

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const handleLogin = async () => {
    if (!data.username.trim() || !data.password.trim()) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: data.username, 
          password: data.password 
        })
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("username", result.username);
        localStorage.setItem("token", result.token);
        let hasKey = localStorage.getItem("privateKey");

        if (!hasKey) {
          const { publicKey, privateKey } = generateKeyPair();
          localStorage.setItem("privateKey", privateKey);
          await fetch(`http://localhost:5000/api/auth/update-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: result.username, publicKey })
          });

          alert("Security keys generated for this new device. Note: Old messages cannot be decrypted.");
        } else {
          alert("Login Successful! 🛡️");
        }
        // -----------------------

        router.push("/chat");
      } else {
        alert(result.error || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-wrapper">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back 🛡️</h2>
            <p>Secure login with key recovery</p>
          </div>
          <div className="auth-form">
            <div className="input-group">
              <label>Username</label>
              <input value={data.username} onChange={(e) => setData({ ...data, username: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <motion.button className="auth-btn" onClick={handleLogin} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Login
            </motion.button>
            <p className="auth-footer">Don't have an account? <a href="/register">Register here</a></p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
