import './login-page.css';
import React from "react";
import { useNavigate } from "react-router-dom";


function LoginPage() {
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		const response = await fetch('http://localhost:3001/api/login', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ email, password })
		});

		if (response.ok) {
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

					<form onSubmit={handleLogin} className="login-form" id="loginForm" noValidate>
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
								{/* <label htmlFor="email">Email Address</label> */}
								<span className="focus-border"></span>
							</div>
							<span className="error-message" id="emailError"></span>
						</div>

						<div className="form-group">
							<div className="input-wrapper password-wrapper">
								<input
									type="password"
									id="password"
									name="password"
									required
									autoComplete="current-password"
									placeholder="Password"
								/>
								{/* <label htmlFor="password">Password</label> */}
								<button
									type="button"
									className="password-toggle"
									id="passwordToggle"
									aria-label="Toggle password visibility"
								>
									<span className="eye-icon"></span>
								</button>
								<span className="focus-border"></span>
							</div>
							<span className="error-message" id="passwordError"></span>
						</div>

						<div className="form-options">
							<label className="remember-wrapper">
								<input type="checkbox" id="remember" name="remember" />
								<span className="checkbox-label">
									<span className="checkmark"></span>
									Remember me
								</span>
							</label>
							<a href="#" className="forgot-password">
								Forgot password?
							</a>
						</div>

						<button
							type="submit" className="login-btn btn">
							<span className="btn-text">Sign In</span>
							<span className="btn-loader"></span>
						</button>
					</form>

					<button onClick={handleSignUp} className="signup-link">
						<p>
							Sign up
						</p>
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
