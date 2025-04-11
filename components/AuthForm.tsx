"use client";

import { useState } from "react";
import { Box, Heading, Button, Flex, Text } from "rebass";
import { Label, Input } from "@rebass/forms";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validatePassword } from "@/utils/helpers";
import ErrorMessage from "@/components/ErrorMessage";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail || !loginPassword) {
      setError("Please enter both email and password");
      return;
    }

    if (!validateEmail(loginEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await login({ email: loginEmail, password: loginPassword });
    } catch (err: any) {
      console.error("Login failed:", err);

      // Try to extract specific validation errors from the backend response
      if (err.response?.data) {
        // Check for array of errors format
        if (
          err.response.data.errors &&
          Array.isArray(err.response.data.errors)
        ) {
          // Format all validation errors into a single message
          const errorMessages = err.response.data.errors
            .map((error: any) => error.msg || error.message)
            .filter(Boolean)
            .join(", ");

          if (errorMessages) {
            setError(`Validation errors: ${errorMessages}`);
            return;
          }
        }

        // Check for a direct error message from the server
        if (err.response.data.message) {
          setError(err.response.data.message);
          return;
        }
      }

      // Check for specific authentication errors
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      setError(
        err.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    if (!email || !password || !confirmPassword || !name) {
      setError("All fields are required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      console.log("Registering user with data:", {
        email,
        password,
        name,
      });
      await register({
        email,
        password,
        name,
      });
    } catch (err: any) {
      console.error("Registration failed:", err);
      console.error("Registration error details:", err.response || err);

      // Try to extract specific validation errors from the backend response
      if (err.response?.data) {
        // Check for array of errors format
        if (
          err.response.data.errors &&
          Array.isArray(err.response.data.errors)
        ) {
          // Format all validation errors into a single message
          const errorMessages = err.response.data.errors
            .map((error: any) => error.msg || error.message)
            .filter(Boolean)
            .join(", ");

          if (errorMessages) {
            setError(`Validation errors: ${errorMessages}`);
            return;
          }
        }

        // Check for a direct error message from the server
        if (err.response.data.message) {
          setError(err.response.data.message);
          return;
        }
      }

      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Heading as="h2" mb={4}>
        {isLogin ? "Sign In to Your Account" : "Create a New Account"}
      </Heading>

      {error && <ErrorMessage message={error} />}

      <Box mb={4}>
        <Flex>
          <Box
            as="button"
            type="button"
            onClick={() => setIsLogin(true)}
            sx={{
              flex: 1,
              py: 2,
              backgroundColor: isLogin ? "primary" : "lightGray",
              color: isLogin ? "white" : "text",
              border: "none",
              borderRadius: "4px 0 0 4px",
              cursor: "pointer",
            }}
          >
            Login
          </Box>
          <Box
            as="button"
            type="button"
            onClick={() => setIsLogin(false)}
            sx={{
              flex: 1,
              py: 2,
              backgroundColor: !isLogin ? "primary" : "lightGray",
              color: !isLogin ? "white" : "text",
              border: "none",
              borderRadius: "0 4px 4px 0",
              cursor: "pointer",
            }}
          >
            Register
          </Box>
        </Flex>
      </Box>

      {isLogin ? (
        // Login Form
        <Box as="form" onSubmit={handleLogin}>
          <Box mb={3}>
            <Label htmlFor="loginEmail" mb={2}>
              Email
            </Label>
            <Input
              id="loginEmail"
              name="email"
              type="email"
              value={loginEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLoginEmail(e.target.value)
              }
              required
              className="form-input"
            />
          </Box>

          <Box mb={3}>
            <Label htmlFor="loginPassword" mb={2}>
              Password
            </Label>
            <Input
              id="loginPassword"
              name="password"
              type="password"
              value={loginPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLoginPassword(e.target.value)
              }
              required
              className="form-input"
            />
          </Box>

          <Box mb={3} textAlign="right">
            <Text
              as="a"
              href="/forgot-password"
              color="primary"
              sx={{
                cursor: "pointer",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Forgot Password?
            </Text>
          </Box>

          <Box>
            <Box
              as="button"
              type="submit"
              className="btn btn-primary"
              width="100%"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Box>
          </Box>
        </Box>
      ) : (
        // Registration Form
        <Box as="form" onSubmit={handleRegister}>
          <Box mb={3}>
            <Label htmlFor="name" mb={2}>
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              required
              className="form-input"
            />
          </Box>

          <Box mb={3}>
            <Label htmlFor="email" mb={2}>
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              className="form-input"
            />
          </Box>

          <Box mb={3}>
            <Label htmlFor="password" mb={2}>
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              className="form-input"
            />
          </Box>

          <Box mb={3}>
            <Label htmlFor="confirmPassword" mb={2}>
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              required
              className="form-input"
            />
          </Box>

          <Box>
            <Box
              as="button"
              type="submit"
              className="btn btn-primary"
              width="100%"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
