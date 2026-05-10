import React, { useState } from "react";
import { Visibility } from "shared";
import { useNavigate } from "react-router-dom";

export function SignUp() {
    const navigate = useNavigate();
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

    const handleSubmit = async (e: React.SyntheticEvent) => {
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
        <>
            <h1>THIS IS FAKE AND UNSAFE – USE A DUMMY PASSWORD</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
                <label>
                    Username
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </label>
                <label>
                    Email
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </label>
                <label>
                    Password
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </label>
                <label>
                    Neighborhood
                    <select name="visibility" value={formData.visibility} onChange={handleChange}>
                        {Object.entries(Visibility)
                            .filter(([, val]) => val !== Visibility.PUBLIC)
                            .map(([key, val]) => (
                                <option key={key} value={val}>{key}</option>
                            ))}
                    </select>
                </label>
                <label>
                    Role
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </label>
                <button type="submit">Sign Up</button>
            </form>
        </>
    );
}