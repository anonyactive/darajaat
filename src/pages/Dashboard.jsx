import { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSubjects: 0,
    readPages: 0,
    percentComplete: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'subjects'));
        let totalSubj = 0;
        let totalPg = 0;
        let readPg = 0;
        
        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          totalSubj++;
          totalPg += (data.totalPages || 0);
          readPg += (data.readPages || 0); // Currently relying on potential global read pages metric 
        });

        const percent = totalPg > 0 ? Math.round((readPg / totalPg) * 100) : 0;
        
        setStats({
          totalSubjects: totalSubj,
          readPages: readPg,
          percentComplete: percent
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { label: 'کل مضامین', value: stats.totalSubjects, icon: <BookOpen />, color: 'var(--primary-color)' },
    { label: 'پڑھے گئے صفحات', value: stats.readPages, icon: <CheckCircle />, color: 'var(--secondary-color)' },
    { label: 'بقیہ نصاب', value: stats.totalSubjects === 0 ? 'N/A' : `${100 - stats.percentComplete}%`, icon: <Clock />, color: '#fbbf24' },
    { label: 'پیش رفت', value: stats.totalSubjects === 0 ? 'N/A' : `${stats.percentComplete}%`, icon: <TrendingUp />, color: 'var(--primary-color)' },
  ];

  return (
    <div className="animate-fade-in delay-1">
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>ڈیش بورڈ</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {statCards.map((stat, idx) => (
          <div key={idx} className="glass-panel items-center flex justify-between" style={{ padding: '1.5rem', borderLeft: `4px solid ${stat.color}` }}>
            <div>
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>{stat.label}</p>
              <h3 style={{ fontSize: '2.5rem', margin: '0.5rem 0 0 0' }}>{stat.value}</h3>
            </div>
            <div style={{ background: `${stat.color}20`, padding: '1rem', borderRadius: '50%', color: stat.color }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6" style={{ marginTop: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: '2 1 400px' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontSize: '1.5rem' }}>حالیہ سرگرمی</h3>
          </div>
          <div className="flex-col gap-4 text-center py-8">
             <p className="text-muted text-lg">تاحال کوئی سرگرمی ریکارڈ نہیں کی گئی۔ نیا مواد شامل کریں۔</p>
          </div>
          <Link to="/add" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
            نئی پیش رفت شامل کریں
          </Link>
        </div>
        
        <div className="glass-panel" style={{ flex: '1 1 300px' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>ہفتہ وار رپورٹ</h3>
          <div className="text-center py-8">
             <p className="text-muted text-lg">ڈیٹا دستیاب نہیں۔</p>
          </div>
        </div>
      </div>
    </div>
  )
}
