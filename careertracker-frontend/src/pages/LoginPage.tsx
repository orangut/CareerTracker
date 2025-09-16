import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, ToggleButton, ToggleButtonGroup, Stack, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { register, signIn } from '../api/authService';

const LoginPage = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    try {
      const response = mode === 'login'
        ? await signIn({ username, password })
        : await register({ username, password });
      const signedInUser = response.user;

      setUser(signedInUser);
    } catch (error: any) {
      setErrorMsg(error || 'An error occurred. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 320, width: 450, boxSizing: 'border-box' }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onMouseDown={() => setShowPassword(true)}
                      onMouseUp={() => setShowPassword(false)}
                      onMouseLeave={() => setShowPassword(false)}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {mode === 'signup' && (<TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onMouseDown={() => setShowConfirmPassword(true)}
                      onMouseUp={() => setShowConfirmPassword(false)}
                      onMouseLeave={() => setShowConfirmPassword(false)}
                      edge="end"
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }} />)}
            {errorMsg && <Typography color="error" variant="body2">{errorMsg}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </Button>
          </form>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={
              (_, value) => {
                value && setMode(value);
                setErrorMsg(undefined);
              }
            }
            aria-label="login or signup"
            fullWidth
            sx={{ mt: 2 }}
          >
            <ToggleButton value="login" aria-label="login">Login</ToggleButton>
            <ToggleButton value="signup" aria-label="signup">Sign Up</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
