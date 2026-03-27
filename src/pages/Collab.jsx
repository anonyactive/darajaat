import { Users, UserPlus, Trophy, Star } from 'lucide-react';

export default function Collab() {
  const classmates = [
    { id: 1, name: 'عبداللہ محمد', progress: 85, rank: 1 },
    { id: 2, name: 'عمر فاروق', progress: 72, rank: 2 },
    { id: 3, name: 'علی رضا', progress: 65, rank: 3 },
  ];

  return (
    <div className="animate-fade-in delay-3">
      <div className="flex justify-between items-center my-8">
        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>ہم جماعت</h2>
        <button className="btn btn-primary" style={{ background: 'var(--secondary-color)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
          <UserPlus size={20} /> نیا دوست شامل کریں
        </button>
      </div>

      <div className="glass-panel text-center mb-8" style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.1))' }}>
        <Users size={64} color="var(--secondary-color)" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>ساتھ مل کر سیکھیں!</h3>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px', fontSize: '1.2rem', lineHeight: 1.8 }}>
          اپنے ہم جماعتوں کو شامل کریں اور ایک دوسرے کی پیش رفت دیکھیں۔ مقابلہ بازی آپ کو سیکھنے میں مزید مدد دے گی۔
        </p>
      </div>

      <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>رینکنگ اور پیش رفت</h3>
      <div className="flex-col gap-4">
        {classmates.map((student) => (
          <div key={student.id} className="glass-panel flex justify-between items-center" style={{ padding: '1.5rem 2rem' }}>
            <div className="flex items-center gap-6">
              <div 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  background: student.rank === 1 ? '#fbbf24' : 'var(--surface-hover)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: student.rank === 1 ? '#000' : '#fff'
                }}
              >
                {student.rank === 1 ? <Trophy size={24} /> : student.rank}
              </div>
              <h4 style={{ fontSize: '1.5rem', margin: 0 }}>{student.name}</h4>
            </div>
            
            <div className="flex items-center gap-6" style={{ width: '40%' }}>
              <div style={{ flex: 1 }}>
                <div style={{ width: '100%', background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${student.progress}%`, background: student.rank === 1 ? '#fbbf24' : 'var(--secondary-color)', height: '100%' }}></div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{student.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
