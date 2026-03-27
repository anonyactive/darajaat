import { useState } from 'react';
import { Book, Plus, Trash2, Edit, FileText } from 'lucide-react';

export default function Subjects() {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'قرآن مجید (تفسیر)', books: 2, progress: 45, totalPages: 500, readPages: 225 },
    { id: 2, name: 'حدیث (صحیح بخاری)', books: 4, progress: 20, totalPages: 1200, readPages: 240 },
    { id: 3, name: 'فقہ', books: 1, progress: 75, totalPages: 300, readPages: 225 },
  ]);

  return (
    <div className="animate-fade-in delay-2">
      <div className="flex justify-between items-center my-8">
        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>مضامین اور نصاب</h2>
        <button className="btn btn-primary">
          <Plus size={20} /> نیا مضمون
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {subjects.map(sub => (
          <div key={sub.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, lineHeight: 1.4 }}>
                  <div style={{ background: 'var(--glass-border)', padding: '0.5rem', borderRadius: '10px' }}>
                    <Book size={24} color="var(--primary-color)" />
                  </div>
                  {sub.name}
                </h3>
                <div className="flex gap-4">
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}><Edit size={20} /></button>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', transition: 'color 0.2s' }}><Trash2 size={20} /></button>
                </div>
              </div>
              
              <div className="flex gap-4 mt-4 mb-6">
                <span className="text-muted flex items-center gap-2" style={{ fontSize: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.8rem', borderRadius: '20px' }}>
                  <Book size={16} /> {sub.books} کتب
                </span>
                <span className="text-muted flex items-center gap-2" style={{ fontSize: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.8rem', borderRadius: '20px' }}>
                  <FileText size={16} /> {sub.readPages} / {sub.totalPages} صفحات
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between mb-2 text-muted" style={{ fontSize: '1rem' }}>
                <span>پیش رفت</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{sub.progress}%</span>
              </div>
              <div style={{ width: '100%', background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${sub.progress}%`, background: 'var(--primary-color)', height: '100%', borderRadius: '5px', transition: 'width 1s ease' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
