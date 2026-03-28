import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, Trash2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOODS = [
  { emoji: '😊', label: 'خوش' },
  { emoji: '😐', label: 'ٹھیک' },
  { emoji: '😔', label: 'اداس' },
  { emoji: '😤', label: 'تھکا ہوا' },
  { emoji: '🎯', label: 'چاق و چوبند' },
];

export default function Diary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toLocaleDateString('ur-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const fetchEntries = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const q = query(
        collection(db, 'diary'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await addDoc(collection(db, 'diary'), {
        userId: user.uid,
        title: noteTitle.trim() || 'آج کا نوٹ',
        note: noteText.trim(),
        mood: selectedMood.emoji,
        moodLabel: selectedMood.label,
        date: new Date().toISOString().slice(0, 10),
        createdAt: serverTimestamp()
      });
      setNoteTitle(''); setNoteText(''); setSelectedMood(MOODS[0]);
      setShowForm(false);
      fetchEntries();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('یہ نوٹ حذف کریں؟')) return;
    await deleteDoc(doc(db, 'diary', id));
    fetchEntries();
  };

  if (!user) return (
    <div className="glass-panel text-center animate-fade-in my-8 py-16">
      <Lock size={64} className="mx-auto opacity-30 mb-4" />
      <h2 style={{ fontSize: '2rem' }}>ڈائری دیکھنے کے لیے لاگ ان کریں</h2>
      <Link to="/login" className="btn btn-primary mt-6">لاگ ان کریں</Link>
    </div>
  );

  return (
    <div className="animate-fade-in delay-1">
      <div className="flex justify-between items-center my-8">
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>📔 میری ڈائری</h2>
          <p className="text-muted" style={{ margin: '0.4rem 0 0', fontSize: '1rem' }}>{today}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={20} /> {showForm ? 'منسوخ' : 'نیا نوٹ'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel mb-8 animate-fade-in" style={{ border: '2px dashed var(--primary-color)' }}>
          <form onSubmit={handleSave} className="flex-col gap-4">
            <input type="text" className="input-field" placeholder="عنوان (اختیاری)" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} />

            {/* Mood selector */}
            <div className="flex gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
              <span className="text-muted" style={{ fontSize: '1rem', lineHeight: '2.5' }}>مزاج:</span>
              {MOODS.map(m => (
                <button key={m.emoji} type="button" onClick={() => setSelectedMood(m)}
                  style={{ background: selectedMood.emoji === m.emoji ? 'rgba(16,185,129,0.2)' : 'transparent', border: selectedMood.emoji === m.emoji ? '2px solid var(--primary-color)' : '2px solid var(--glass-border)', borderRadius: '12px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '1.3rem', transition: 'all 0.2s' }}>
                  {m.emoji} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{m.label}</span>
                </button>
              ))}
            </div>

            <textarea className="input-field mt-4" rows={5} placeholder="آج کا نوٹ، سیکھا ہوا، یاد رکھنے والی بات..." style={{ resize: 'vertical', lineHeight: '2', fontSize: '1.1rem' }} value={noteText} onChange={e => setNoteText(e.target.value)} required />

            <button type="submit" className="btn btn-primary mt-4" style={{ alignSelf: 'flex-start' }}>محفوظ کریں</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted py-12 text-xl">لوڈ ہو رہا ہے...</div>
      ) : (
        <div className="flex-col gap-6">
          {entries.map(entry => (
            <div key={entry.id} className="glass-panel animate-fade-in" style={{ borderRight: '4px solid var(--primary-color)' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '2rem' }}>{entry.mood}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{entry.title}</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>
                      {entry.moodLabel} · {entry.date}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(entry.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7 }}>
                  <Trash2 size={18} />
                </button>
              </div>
              <p style={{ margin: 0, lineHeight: '2', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>{entry.note}</p>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="glass-panel text-center py-12">
              <BookOpen size={48} className="mx-auto opacity-30 mb-4" />
              <p className="text-muted text-xl">ابھی تک کوئی نوٹ نہیں۔ اپنا پہلا نوٹ لکھیں!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
