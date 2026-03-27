import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Shield, Info, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';

export default function Settings() {
  const { user, role } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        await updateProfile(user, { displayName: name });
        setMessage('پروفائل کامیابی سے اپ ڈیٹ ہو گئی۔');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error(error);
      setMessage('پروفائل اپ ڈیٹ کرنے میں مسلہ ہوا۔');
    }
  };

  if (!user) {
    return (
      <div className="glass-panel text-center animate-fade-in my-8 p-8 py-16">
        <SettingsIcon size={64} className="mx-auto text-muted mb-4 opacity-50" />
        <h2 style={{ fontSize: '2rem' }}>ترتیبات دیکھنے کے لیے لاگ ان کریں</h2>
      </div>
    );
  }

  return (
    <div className="animate-fade-in delay-2" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex items-center gap-4 my-8">
        <SettingsIcon size={36} color="var(--primary-color)" />
        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>ترتیبات</h2>
      </div>

      <div className="flex-col gap-6">
        {/* Profile Card */}
        <div className="glass-panel">
          <div className="flex items-center gap-3 mb-6">
            <User size={28} color="var(--primary-color)" />
            <h3 style={{ fontSize: '1.6rem', margin: 0 }}>اکاؤنٹ کی معلومات</h3>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="flex-col gap-4">
            <div>
              <label className="text-muted block mb-2" style={{ fontSize: '1.1rem' }}>ای میل (تبدیل نہیں کیا جا سکتا)</label>
              <input type="email" className="input-field" value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            
            <div className="mt-4">
              <label className="text-muted block mb-2" style={{ fontSize: '1.1rem' }}>آپ کا نام</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="اپنا نام درج کریں..." 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>

            {message && <div className="mt-4" style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>{message}</div>}

            <button type="submit" className="btn btn-primary mt-6" style={{ alignSelf: 'flex-start' }}>محفوظ کریں</button>
          </form>
        </div>

        {/* Roles Details */}
        <div className="glass-panel">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={28} color="var(--secondary-color)" />
            <h3 style={{ fontSize: '1.6rem', margin: 0 }}>عہدہ و اختیارات</h3>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '1.2rem' }}>موجودہ عہدہ:</span>
            <span className="btn" style={{ background: 'var(--glass-border)', pointerEvents: 'none', padding: '0.5rem 1rem' }}>
              {role === 'superadmin' ? 'سپر ایڈمن' : role === 'admin' ? 'ایڈمن' : role === 'user' ? 'طالب علم' : 'نامعلوم'}
            </span>
          </div>
          <p className="text-muted mt-4" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
            {role === 'user' && 'آپ صرف مضامین دیکھ سکتے ہیں۔ مضامین شامل کرنے کے لیے ایڈمن سے رابطہ کریں۔'}
            {role === 'admin' && 'آپ کو نئے مضامین شامل کرنے اور حذف کرنے کا اختیار حاصل ہے۔'}
            {(role === 'superadmin') && 'آپ کو ایپ میں موجود تمام ڈیٹا پر مکمل کنٹرول حاصل ہے۔'}
          </p>
        </div>

        {/* System Settings */}
        <div className="glass-panel">
          <div className="flex items-center gap-3 mb-6">
            <Info size={28} color="var(--text-main)" />
            <h3 style={{ fontSize: '1.6rem', margin: 0 }}>ایپ کی معلومات</h3>
          </div>
          
          <div className="flex justify-between items-center pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '1.2rem' }}>
            <span>ورژن</span>
            <span className="text-muted">1.0.0 PWA</span>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: '1.2rem' }}>
            <span>ڈویلپر</span>
            <span className="text-muted">درجات ٹیم</span>
          </div>
          
          <button onClick={() => signOut(auth)} className="btn btn-danger mt-8 w-full" style={{ width: '100%', fontSize: '1.2rem' }}>
            <LogOut size={20} /> اکاؤنٹ سے لاگ آؤٹ کریں
          </button>
        </div>
      </div>
    </div>
  );
}
