import { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!auth.app.options.apiKey || auth.app.options.apiKey === 'YOUR_API_KEY') {
      setError('ایپ میں فائر بیس (Firebase) منسلک نہیں ہے۔ آپ کو Firebase Keys درج کرنا ہوں گی۔');
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      setError('ای میل یا پاس ورڈ غلط ہے۔');
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError('گوگل سائن ان میں مسلہ: ' + err.message);
      console.error(err);
    }
  };

  if (user) {
    return (
      <div className="glass-panel text-center animate-fade-in my-8" style={{ maxWidth: '500px', margin: '4rem auto', padding: '3rem' }}>
        <h2 style={{ fontSize: '2rem' }}>آپ لاگ ان ہیں</h2>
        <p className="text-muted mt-4" style={{ fontSize: '1.2rem' }}>{user.email}</p>
        <div style={{ margin: '1rem 0', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'inline-block' }}>
          عہدہ: <strong style={{ color: 'var(--primary-color)' }}>{role === 'superadmin' ? 'سپر ایڈمن' : role === 'admin' ? 'ایڈمن' : 'طالب علم'}</strong>
        </div>
        <br />
        <button className="btn btn-danger mt-4" onClick={() => signOut(auth)}>لاگ آؤٹ</button>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in delay-1" style={{ maxWidth: '450px', margin: '4rem auto', padding: '2.5rem' }}>
      <h2 className="text-center" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        {isRegistering ? 'نیا اکاؤنٹ بنائیں' : 'لاگ ان کریں'}
      </h2>
      
      {error && (
        <div className="animate-fade-in" style={{ background: 'var(--danger)', color: '#fff', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleAuth} className="flex-col gap-4">
        <input 
          type="email" 
          placeholder="آپ کا ای میل" 
          className="input-field" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="پاس ورڈ (کم از کم 6 ہندسے)" 
          className="input-field mt-4" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary mt-4 w-full" style={{ width: '100%' }}>
          {isRegistering ? 'رجسٹر کریں' : 'لاگ ان'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        <span style={{ padding: '0 1rem', color: 'var(--text-muted)' }}>یا</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
      </div>

      <button type="button" onClick={handleGoogleLogin} className="btn w-full flex items-center justify-center gap-2" style={{ width: '100%', background: '#fff', color: '#000', border: 'none', fontWeight: 'bold' }}>
        <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px' }} />
        گوگل کے ذریعے لاگ ان کریں
      </button>

      <p className="text-center mt-6 text-muted" style={{ cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'پہلے سے اکاؤنٹ ہے؟ لاگ ان کریں' : 'اکاؤنٹ نہیں ہے؟ نیا بنائیں'}
      </p>
    </div>
  );
}
