import React, { useState } from "react";
import { Visibility } from "shared";
import { useNavigate } from "react-router-dom";

export function SignUp() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        visibility: Visibility.KIRSEBERG,
        role: 'user',
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch('http://localhost:3001/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? 'Something went wrong.');
                return;
            }

            navigate('/');
        } catch (err) {
            console.error('Error:', err);
            setError('Could not connect to server.');
        }
    };

    return (
        <div className="app-wrapper">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Create Account</h2>
                        <p>Join our community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="focus-border"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="focus-border"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    <span className="eye-icon" style={{ color: '#000' }}>
                                        {showPassword ? '🙈' : '👁️'}
                                    </span>
                                </button>
                                <span className="focus-border"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <select
                                    name="visibility"
                                    value={formData.visibility}
                                    onChange={handleChange}
                                    className="styled-select"
                                    required
                                >
                                    {Object.entries(Visibility)
                                        .filter(([, val]) => val !== Visibility.PUBLIC)
                                        .map(([key, val]) => (
                                            <option key={key} value={val}>{key}</option>
                                        ))}
                                </select>
                                <span className="focus-border"></span>
                            </div>
                        </div>

                        <button type="submit" className="login-btn btn">
                            <span className="btn-text">Sign Up</span>
                        </button>
                    </form>

                    <button
                        onClick={() => navigate('/')}
                        className="secondary-btn"
                    >
                        Already have an account? Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}