'use client';

import { useState } from 'react';
import { Box, Heading, Button, Flex, Text } from 'rebass';
import { Label, Input } from '@rebass/forms';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword } from '@/utils/helpers';
import ErrorMessage from '@/components/ErrorMessage';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  
  const { login, register } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!loginEmail || !loginPassword) {
      setError('Please enter both email and password');
      return;
    }
    
    if (!validateEmail(loginEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      await login({ email: loginEmail, password: loginPassword });
    } catch (err: any) {
      console.error('Login failed:', err);
      
      // Try to extract specific validation errors from the backend response
      if (err.response?.data) {
        // Check for array of errors format
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          // Format all validation errors into a single message
          const errorMessages = err.response.data.errors
            .map((error: any) => error.msg || error.message)
            .filter(Boolean)
            .join(', ');
            
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
        setError('Invalid email or password. Please try again.');
        return;
      }
      
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate all fields
    if (!username || !email || !password || !confirmPassword || !firstName || !lastName) {
      setError('All fields are required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      console.log("Registering user with data:", {
        username,
        email,
        password,
        firstName,
        lastName,
        role
      });
      await register({
        username,
        email,
        password,
        firstName,
        lastName,
        role
      });
    } catch (err: any) {
      console.error('Registration failed:', err);
      console.error('Registration error details:', err.response || err);
      
      // Try to extract specific validation errors from the backend response
      if (err.response?.data) {
        // Check for array of errors format
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          // Format all validation errors into a single message
          const errorMessages = err.response.data.errors
            .map((error: any) => error.msg || error.message)
            .filter(Boolean)
            .join(', ');
            
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
      
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Heading as="h2" mb={4}>
        {isLogin ? 'Sign In to Your Account' : 'Create a New Account'}
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
              backgroundColor: isLogin ? 'primary' : 'lightGray',
              color: isLogin ? 'white' : 'text',
              border: 'none',
              borderRadius: '4px 0 0 4px',
              cursor: 'pointer',
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
              backgroundColor: !isLogin ? 'primary' : 'lightGray',
              color: !isLogin ? 'white' : 'text',
              border: 'none',
              borderRadius: '0 4px 4px 0',
              cursor: 'pointer',
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
            <Label htmlFor="loginEmail" mb={2}>Email</Label>
            <Input
              id="loginEmail"
              name="email"
              type="email"
              value={loginEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value)}
              required
              className="form-input"
            />
          </Box>
          
          <Box mb={4}>
            <Label htmlFor="loginPassword" mb={2}>Password</Label>
            <Input
              id="loginPassword"
              name="password"
              type="password"
              value={loginPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Box>
          </Box>
        </Box>
      ) : (
        // Registration Form
        <Box as="form" onSubmit={handleRegister}>
          <Flex mx={-2} flexWrap="wrap">
            <Box width={1/2} px={2} mb={3}>
              <Label htmlFor="firstName" mb={2}>First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                required
                className="form-input"
              />
            </Box>
            
            <Box width={1/2} px={2} mb={3}>
              <Label htmlFor="lastName" mb={2}>Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                required
                className="form-input"
              />
            </Box>
          </Flex>
          
          <Box mb={3}>
            <Label htmlFor="username" mb={2}>Username</Label>
            <Input
              id="username"
              name="username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
              className="form-input"
            />
          </Box>
          
          <Box mb={3}>
            <Label htmlFor="email" mb={2}>Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </Box>
          
          <Box mb={3}>
            <Label htmlFor="password" mb={2}>Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </Box>
          
          <Box mb={4}>
            <Label htmlFor="confirmPassword" mb={2}>Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
            />
          </Box>
          
          <Box mb={4}>
            <Label htmlFor="role" mb={2}>Account Type</Label>
            <Box as="select"
              id="role"
              name="role"
              value={role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                // TypeScript is having issues with the string union, so we need to cast it
                const roleValue = e.target.value;
                if (roleValue === 'student') {
                  setRole(roleValue);
                }
              }}
              sx={{
                display: 'block',
                width: '100%',
                p: 2,
                appearance: 'none',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                border: '1px solid',
                borderColor: 'gray',
                borderRadius: '4px',
                color: 'inherit',
                backgroundColor: 'background',
              }}
              disabled
              title="Only student accounts can be created through public registration"
            >
              <option value="student">Student</option>
            </Box>
            <Box as="div" mt={1} sx={{ fontSize: 'sm', color: 'gray', fontStyle: 'italic' }}>
              Note: Teacher and admin accounts must be created by an administrator
            </Box>
          </Box>
          
          <Box>
            <Box
              as="button"
              type="submit"
              className="btn btn-primary"
              width="100%"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}