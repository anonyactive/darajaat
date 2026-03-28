import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Plus, LogIn, Copy, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Generate a random 8-char alphanumeric join code
function generateCode() {
  return 'CLS-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export default function Classes() {
  const { user, isAdmin, isSuperAdmin, activeClassId, activeClassName, switchClass } = useAuth();
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchMyClasses = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const memberships = await getDocs(query(collection(db, 'class_members'), where('userId', '==', user.uid)));
      const classIds = memberships.docs.map(d => d.data().classId);
      
      if (classIds.length === 0) { setMyClasses([]); setLoading(false); return; }
      
      const classData = await Promise.all(classIds.map(id => getDoc(doc(db, 'classes', id))));
      setMyClasses(classData.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchMyClasses(); }, [user]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newClassName.trim()) return;
    const code = generateCode();
    try {
      const classRef = await addDoc(collection(db, 'classes'), {
        name: newClassName.trim(),
        code,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      // Auto-add creator as member
      await addDoc(collection(db, 'class_members'), { classId: classRef.id, userId: user.uid, joinedAt: serverTimestamp() });
      await switchClass(classRef.id, newClassName.trim());
      setNewClassName('');
      setShowCreate(false);
      fetchMyClasses();
    } catch (e) { console.error(e); }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    setJoinError('');
    try {
      const q = query(collection(db, 'classes'), where('code', '==', joinCode.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) { setJoinError('یہ کوڈ غلط ہے۔ دوبارہ کوشش کریں۔'); return; }
      
      const classDoc = snap.docs[0];
      const classId = classDoc.id;
      const className = classDoc.data().name;

      // Check if already a member
      const existing = await getDocs(query(collection(db, 'class_members'), where('classId', '==', classId), where('userId', '==', user.uid)));
      if (!existing.empty) { setJoinError('آپ پہلے سے اس کلاس کے ممبر ہیں۔'); return; }

      await addDoc(collection(db, 'class_members'), { classId, userId: user.uid, joinedAt: serverTimestamp() });
      await switchClass(classId, className);
      setJoinCode('');
      fetchMyClasses();
    } catch (e) { console.error(e); setJoinError('ایک مسئلہ پیش آیا۔ دوبارہ کوشش کریں۔'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleDeleteClass = async (id, name) => {
    if (!isSuperAdmin) return;
    if (!window.confirm(`"${name}" کو مکمل طور پر حذف کریں؟ اس کلاس کا تمام ڈیٹا ختم ہو جائے گا۔`)) return;
    await deleteDoc(doc(db, 'classes', id));
    fetchMyClasses();
  };

  if (!user) {
    return (
      <div className="glass-panel text-center animate-fade-in my-8 py-16">
        <GraduationCap size={64} className="mx-auto text-muted mb-4 opacity-50" />
        <h2 style={{ fontSize: '2rem' }}>کلاسز دیکھنے کے لیے لاگ ان کریں</h2>
        <Link to="/login" className="btn btn-primary mt-6">لاگ ان کریں</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in delay-1">
      <div className="flex justify-between items-center my-8">
        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>کلاسز</h2>
        <div className="flex gap-4">
          {isAdmin && (
            <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
              <Plus size={20} /> نئی کلاس بنائیں
            </button>
          )}
        </div>
      </div>

      {/* Active class banner */}
      {activeClassName && (
        <div className="glass-panel mb-6 flex justify-between items-center" style={{ border: '2px solid var(--primary-color)', padding: '1rem 1.5rem' }}>
          <div className="flex items-center gap-4">
            <GraduationCap size={28} color="var(--primary-color)" />
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '1rem' }}>فعال کلاس</p>
              <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{activeClassName}</h3>
            </div>
          </div>
          <span style={{ background: 'var(--primary-color)', color: '#000', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>Active</span>
        </div>
      )}

      {/* Create class form (Admin only) */}
      {showCreate && isAdmin && (
        <div className="glass-panel mb-6 animate-fade-in" style={{ border: '2px dashed var(--primary-color)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>نئی کلاس بنائیں</h3>
          <form onSubmit={handleCreateClass} className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <input type="text" placeholder="کلاس کا نام مثلاً: جماعت دہم الف" className="input-field" style={{ flex: '1 1 250px' }} value={newClassName} onChange={e => setNewClassName(e.target.value)} required />
            <button type="submit" className="btn btn-primary">بنائیں</button>
          </form>
        </div>
      )}

      {/* Join by code */}
      <div className="glass-panel mb-8">
        <div className="flex items-center gap-3 mb-4">
          <LogIn size={24} color="var(--secondary-color)" />
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>کوڈ سے کلاس جوائن کریں</h3>
        </div>
        <form onSubmit={handleJoinByCode} className="flex gap-4" style={{ flexWrap: 'wrap' }}>
          <input type="text" placeholder="کوڈ درج کریں مثلاً: CLS-AB12" className="input-field" style={{ flex: '1 1 200px', textTransform: 'uppercase' }} value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
          <button type="submit" className="btn" style={{ background: 'var(--secondary-color)', color: '#fff' }}>جوائن کریں</button>
        </form>
        {joinError && <p style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '1.1rem' }}>{joinError}</p>}
      </div>

      {/* My classes list */}
      <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>میری کلاسز</h3>
      {loading ? (
        <div className="text-center text-muted py-8 text-xl">لوڈ ہو رہا ہے...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {myClasses.map(cls => (
            <div key={cls.id} className="glass-panel" style={{ border: activeClassId === cls.id ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div style={{ background: 'rgba(16,185,129,0.15)', padding: '0.7rem', borderRadius: '12px' }}>
                    <GraduationCap size={24} color="var(--primary-color)" />
                  </div>
                  <h4 style={{ fontSize: '1.5rem', margin: 0 }}>{cls.name}</h4>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    title="کلاس حذف کریں"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', padding: '0.4rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}
                  >
                    <Trash2 size={16} /> حذف
                  </button>
                )}
              </div>

              {isAdmin && cls.code && (
                <div className="flex items-center gap-3 mb-4" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.7rem 1rem', borderRadius: '10px' }}>
                  <span className="text-muted" style={{ fontSize: '1rem' }}>جوائن کوڈ:</span>
                  <code style={{ fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: '3px', color: 'var(--primary-color)', fontWeight: 'bold' }}>{cls.code}</code>
                  <button onClick={() => copyCode(cls.code)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: 'auto' }}>
                    {copiedCode === cls.code ? <Check size={18} color="var(--primary-color)" /> : <Copy size={18} />}
                  </button>
                </div>
              )}

              <button
                onClick={() => switchClass(cls.id, cls.name)}
                className="btn"
                style={{ width: '100%', background: activeClassId === cls.id ? 'var(--primary-color)' : 'var(--glass-border)', color: activeClassId === cls.id ? '#000' : 'var(--text-main)', fontWeight: activeClassId === cls.id ? 'bold' : 'normal' }}
              >
                {activeClassId === cls.id ? '✓ فعال کلاس' : 'اس کلاس میں جائیں'}
              </button>
            </div>
          ))}
          {myClasses.length === 0 && (
            <p className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '1.2rem', paddingTop: '2rem' }}>
              آپ کسی بھی کلاس کے ممبر نہیں ہیں۔ اوپر دیے گئے کوڈ سے جوائن کریں۔
            </p>
          )}
        </div>
      )}
    </div>
  );
}
