import { BookOpen, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { label: 'کل مضامین', value: 4, icon: <BookOpen />, color: 'var(--primary-color)' },
    { label: 'پڑھے گئے صفحات', value: 342, icon: <CheckCircle />, color: 'var(--secondary-color)' },
    { label: 'موجودہ ہفتہ', value: '+45', icon: <TrendingUp />, color: 'var(--primary-color)' },
    { label: 'بقیہ نصاب', value: '45%', icon: <Clock />, color: '#fbbf24' },
  ];

  return (
    <div className="animate-fade-in delay-1">
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>ڈیش بورڈ</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat, idx) => (
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
            <Link to="/add" className="text-muted" style={{ fontSize: '0.9rem' }}>سب دیکھیں</Link>
          </div>
          <div className="flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', paddingTop: '1rem' }}>
                <div className="flex items-center gap-4">
                  <div style={{ background: 'var(--primary-color)', width: 12, height: 12, borderRadius: '50%', boxShadow: '0 0 10px var(--primary-color)' }}></div>
                  <p style={{ fontSize: '1.2rem', margin: 0 }}>تفسیر القرآن - باب نمبر {i + 2}</p>
                </div>
                <span className="text-muted">آج</span>
              </div>
            ))}
          </div>
          <Link to="/add" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
            نئی پیش رفت شامل کریں
          </Link>
        </div>
        
        <div className="glass-panel" style={{ flex: '1 1 300px' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>ہفتہ وار رپورٹ</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', justifyContent: 'center' }}>
            {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
              <div key={i} style={{ width: '100%', maxWidth: '30px', height: `${h}%`, background: h > 70 ? 'var(--primary-color)' : 'var(--secondary-color)', borderRadius: '6px 6px 0 0', opacity: 0.9, transition: 'height 1s ease' }}></div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-muted" style={{ fontSize: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
            <span>پیر</span>
            <span>اتوار</span>
          </div>
        </div>
      </div>
    </div>
  )
}
