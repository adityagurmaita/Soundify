import { render, screen } from '@testing-library/react';
import App from './App';
import { getSongs } from './services/musicApi';

jest.mock('./firebase', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth, cb) => { cb(null); return () => {}; },
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));
jest.mock('./services/musicApi', () => ({ getSongs: jest.fn().mockResolvedValue([]) }));

test('renders Soundify login instead of the starter template', async () => {
  getSongs.mockResolvedValue([]);
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Login to Soundify/ })).toBeInTheDocument();
});
