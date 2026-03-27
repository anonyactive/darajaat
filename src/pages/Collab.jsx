import { useState, useEffect } from 'react';
import { Users, UserPlus, Trophy } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Collab() {
  const [classmates, setClassmates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassmates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        
        // Simulating progress mapping for UI display until individual schema holds metrics
        const mappedUsers = users.map((u, index) => ({
          ...u,
          progress: u.role === 'superadmin' ? 100 : Math.floor(Math.random() * 80) + 10,
          rank: index + 1
        }));
        
        setClassmates(mappedUsers);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchClassmates();
  }, []);

  return (
    <div className="animate-fade-in delay-3">
      <div className="flex justify-between items-center my-8">
        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>ہم جماعت</h2>
        <button className="btn btn-primary" style={{ background: 'var(--secondary-color)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
          <UserPlus size={20} /> دوست شامل کریں
        </button>
      </div>

      <div className="glass-panel text-center mb-8" style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.1))' }}>
        <Users size={64} color="var(--secondary-color)" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>ساتھ مل کر سیکھیں!</h3>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px', fontSize: '1.2rem', lineHeight: 1.8 }}>
          یہاں آپ ایپ پر رجسٹرڈ دیگر طلباء اور اساتذہ کو دیکھ سکتے ہیں۔
        </p>
      </div>

      <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>رجسٹرڈ ممبران</h3>
      
      {loading ? (
        <div className="text-center text-muted py-8 text-xl">لوڈ ہو رہا ہے...</div>
      ) : (
        <div className="flex-col gap-4">
          {classmates.map((student, index) => (
            <div key={student.id} className="glass-panel flex justify-between items-center" style={{ padding: '1.5rem 2rem' }}>
              <div className="flex items-center gap-6">
                <div 
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: index === 0 ? '#fbbf24' : 'var(--surface-hover)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: index === 0 ? '#000' : '#fff'
                  }}
                >
                  {index === 0 ? <Trophy size={24} /> : (index + 1)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', margin: 0 }}>{student.name || student.email?.split('@')[0]}</h4>
                  <p className="text-muted m-0">{student.role === 'admin' || student.role === 'superadmin' ? 'ایڈمنسٹریٹر' : 'طالب علم'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6" style={{ width: '40%' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ width: '100%', background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${student.progress}%`, background: index === 0 ? '#fbbf24' : 'var(--secondary-color)', height: '100%' }}></div>
                  </div>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{student.progress}%</span>
              </div>
            </div>
          ))}
          {classmates.length === 0 && <p className="text-muted text-center py-4">کوئی ممبر موجود نہیں۔</p>}
        </div>
      )}
    </div>
  );
}
