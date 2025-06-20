import React, { useState } from "react";
import theme from "../theme";
import "./AuthPage.css";

// PUBLIC_INTERFACE
/**
 * AuthPage - combines login/register with toggle, taking external submit handler.
 * @param {function} onAuthenticate(username, password, isLogin): void - called on submit
 * @param {string} errorMessage - Optional error message string
 */
function AuthPage({ onAuthenticate, errorMessage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = e => {
    e.preventDefault();
    if (username.length && password.length) {
      onAuthenticate(username, password, isLogin);
    }
  };

  return (
    <div className="auth-root" style={{ background: theme.colors.background }}>
      <div className="auth-form-container">
        <h2>{isLogin ? "Sign In" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            autoFocus
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
          <button type="submit" className="auth-btn">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        {errorMessage && (
          <div className="auth-error">{errorMessage}</div>
        )}
        <div className="auth-toggle">
          {isLogin ? "New user?" : "Already have an account?"}{" "}
          <button className="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
