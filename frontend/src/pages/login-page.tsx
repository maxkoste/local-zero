import './login-page.css';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const response = await fetch('http://localhost:3001/api/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate("/front");
        } else {
            const err = await response.json();
            alert(err.error);
        }
    };

    const handleSignUp = () => {
        navigate("/sign-up");
    };

    return (
        <div className="app-wrapper">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form" noValidate>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder="Email"
                                />
                                <span className="focus-border"></span>
                            </div>
                            <span className="error-message" id="emailError"></span>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    <span className="eye-icon" style={{ color: 'black' }}>
                                        {showPassword ? '🙈' : '👁️'}
                                    </span>
                                </button>
                                <span className="focus-border"></span>
                            </div>
                            <span className="error-message" id="passwordError"></span>
                        </div>

                        <button type="submit" className="login-btn btn">
                            <span className="btn-text">Sign In</span>
                            <span className="btn-loader"></span>
                        </button>
                    </form>

                    {/* Small "Sign up" button styled like secondary button */}
                    <button onClick={handleSignUp} className="secondary-btn">
                        Sign up
                    </button>

                    <div className="success-message" id="successMessage">
                        <div className="success-icon">✓</div>
                        <h3>Login Successful!</h3>
                        <p>Redirecting to your dashboard...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;