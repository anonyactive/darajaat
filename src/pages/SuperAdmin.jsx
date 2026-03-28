import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection, getDocs, addDoc, deleteDoc, updateDoc,
  doc, serverTimestamp, query, where
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Shield, Users, BookOpen, GraduationCap, Trash2,
  Edit, Plus, RefreshCw, Check, X, Save, AlertTriangle
} from 'lucide-react';

function generateCode() {
  return 'DRJ-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// ─── Tab: Stats Overview ─────────────────────────────────────────────────────
function StatsTab({ users, classes, subjects }) {
  const stats = [
    { label: 'کل صارفین', value: users.length, icon: <Users size={28} />, color: 'var(--primary-color)' },
    { label: 'کل کلاسز', value: classes.length, icon: <GraduationCap size={28} />, color: 'var(--secondary-color)' },
    { label: 'کل مضامین', value: subjects.length, icon: <BookOpen size={28} />, color: '#fbbf24' },
    { label: 'ایڈمنز', value: users.filter(u => u.role === 'admin' || u.role === 'superadmin').length, icon: <Shield size={28} />, color: 'var(--danger)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
      {stats.map((s, i) => (
        <div key={i} className="glass-panel flex justify-between items-center" style={{ borderLeft: `4px solid ${s.color}` }}>
          <div>
            <p className="text-muted" style={{ fontSize: '1rem', margin: 0 }}>{s.label}</p>
            <h3 style={{ fontSize: '3rem', margin: '0.5rem 0 0', color: s.color }}>{s.value}</h3>
          </div>
          <div style={{ color: s.color, opacity: 0.4 }}>{s.icon}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Users Management ───────────────────────────────────────────────────
function UsersTab({ users, onRefresh }) {
  const ROLES = ['user', 'admin', 'superadmin'];

  const updateRole = async (uid, newRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      onRefresh();
    } catch (e) { alert('خطا: ' + e.message); }
  };

  const deleteUser = async (uid) => {
    if (!window.confirm('کیا آپ اس صارف کا ڈیٹا حذف کرنا چاہتے ہیں؟')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      onRefresh();
    } catch (e) { alert('خطا: ' + e.message); }
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>تمام صارفین ({users.length})</h3>
      <div className="flex-col gap-4">
        {users.map(u => (
          <div key={u.id} className="glass-panel flex justify-between items-center" style={{ padding: '1rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{u.email}</p>
              <p className="text-muted" style={{ margin: '0.3rem 0 0', fontSize: '0.95rem' }}>{u.createdAt?.slice?.(0, 10) || 'N/A'}</p>
            </div>
            <div className="flex gap-4 items-center">
              <select
                value={u.role || 'user'}
                onChange={e => updateRole(u.id, e.target.value)}
                className="input-field"
                style={{ padding: '0.5rem 1rem', fontSize: '1rem', width: 'auto', background: 'var(--surface-color)' }}
              >
                {ROLES.map(r => <option key={r} value={r}>{r === 'superadmin' ? 'سپر ایڈمن' : r === 'admin' ? 'ایڈمن' : 'طالب علم'}</option>)}
              </select>
              <button onClick={() => deleteUser(u.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-muted text-center py-8">کوئی صارف نہیں ملا۔</p>}
      </div>
    </div>
  );
}

// ─── Tab: Classes Management ─────────────────────────────────────────────────
function ClassesTab({ classes, onRefresh }) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const createClass = async (e) => {
    e.preventDefault();
    const code = generateCode();
    try {
      await addDoc(collection(db, 'classes'), { name: newName.trim(), code, createdAt: serverTimestamp() });
      setNewName('');
      onRefresh();
    } catch (e) { alert('خطا: ' + e.message); }
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'classes', id), { name: editName });
      setEditId(null);
      onRefresh();
    } catch (e) { alert('خطا: ' + e.message); }
  };

  const deleteClass = async (id) => {
    if (!window.confirm('یہ درجہ حذف کریں؟')) return;
    try {
      await deleteDoc(doc(db, 'classes', id));
      onRefresh();
    } catch (e) { alert('خطا: ' + e.message); }
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>تمام درجات ({classes.length})</h3>
      <form onSubmit={createClass} className="glass-panel flex gap-4 mb-6" style={{ flexWrap: 'wrap', border: '2px dashed var(--primary-color)' }}>
        <input type="text" className="input-field" style={{ flex: '1 1 200px' }} placeholder="نئی کلاس کا نام" value={newName} onChange={e => setNewName(e.target.value)} required />
        <button type="submit" className="btn btn-primary"><Plus size={18} /> بنائیں</button>
      </form>
      <div className="flex-col gap-4">
        {classes.map(cls => (
          <div key={cls.id} className="glass-panel flex justify-between items-center" style={{ padding: '1rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            {editId === cls.id ? (
              <input className="input-field" style={{ flex: '1 1 200px' }} value={editName} onChange={e => setEditName(e.target.value)} />
            ) : (
              <div>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>{cls.name}</p>
                <code style={{ color: 'var(--primary-color)', letterSpacing: '2px' }}>{cls.code}</code>
              </div>
            )}
            <div className="flex gap-4">
              {editId === cls.id ? (
                <>
                  <button onClick={() => saveEdit(cls.id)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}><Check size={20} /></button>
                  <button onClick={() => setEditId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditId(cls.id); setEditName(cls.name); }} style={{ background: 'transparent', border: 'none', color: 'var(--secondary-color)', cursor: 'pointer' }}><Edit size={20} /></button>
                  <button onClick={() => deleteClass(cls.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={20} /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Subjects Management ─────────────────────────────────────────────────
function SubjectsTab({ subjects, classes, onRefresh }) {
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const deleteSubject = async (id) => {
    if (!window.confirm('یہ مضمون حذف کریں؟')) return;
    try {
      await deleteDoc(doc(db, 'subjects', id));
      onRefresh();
    } catch (e) { alert('خطا: ' + e.message); }
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'subjects', id), {
        name: editData.name,
        bookName: editData.bookName,
        syllabus: editData.syllabus,
        totalPages: parseInt(editData.totalPages) || 0,
        readPages: parseInt(editData.readPages) || 0,
      });
      setEditId(null);
      onRefresh();
    } catch (e) { alert('خطا: ' + e.message); }
  };

  const getClassName = (classId) => classes.find(c => c.id === classId)?.name || classId;

  return (
    <div>
      <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>تمام مضامین ({subjects.length})</h3>
      <div className="flex-col gap-4">
        {subjects.map(sub => (
          <div key={sub.id} className="glass-panel" style={{ padding: '1.5rem' }}>
            {editId === sub.id ? (
              <div className="flex-col gap-4">
                <input className="input-field" placeholder="مضمون" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                <input className="input-field mt-4" placeholder="کتاب" value={editData.bookName || ''} onChange={e => setEditData({ ...editData, bookName: e.target.value })} />
                <textarea className="input-field mt-4" rows={2} placeholder="نصاب" value={editData.syllabus || ''} onChange={e => setEditData({ ...editData, syllabus: e.target.value })} />
                <div className="flex gap-4 mt-4">
                  <input className="input-field" type="number" placeholder="کل صفحات" value={editData.totalPages || ''} onChange={e => setEditData({ ...editData, totalPages: e.target.value })} style={{ flex: 1 }} />
                  <input className="input-field" type="number" placeholder="پڑھے گئے" value={editData.readPages || ''} onChange={e => setEditData({ ...editData, readPages: e.target.value })} style={{ flex: 1 }} />
                </div>
                <div className="flex gap-4 mt-4">
                  <button className="btn btn-primary" onClick={() => saveEdit(sub.id)} style={{ flex: 1 }}><Save size={16} /> محفوظ</button>
                  <button className="btn btn-danger" onClick={() => setEditId(null)}>منسوخ</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>{sub.name}</p>
                  <p className="text-muted" style={{ margin: '0.3rem 0 0', fontSize: '1rem' }}>{sub.bookName || '—'} | {getClassName(sub.classId)}</p>
                  {sub.syllabus && <p className="text-muted" style={{ margin: '0.3rem 0 0', fontSize: '0.95rem' }}>{sub.syllabus.slice(0, 80)}{sub.syllabus.length > 80 ? '...' : ''}</p>}
                  <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', color: 'var(--primary-color)' }}>{sub.readPages || 0} / {sub.totalPages || 0} صفحات</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setEditId(sub.id); setEditData(sub); }} style={{ background: 'transparent', border: 'none', color: 'var(--secondary-color)', cursor: 'pointer' }}><Edit size={20} /></button>
                  <button onClick={() => deleteSubject(sub.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={20} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {subjects.length === 0 && <p className="text-muted text-center py-8">کوئی مضمون نہیں ملا۔</p>}
      </div>
    </div>
  );
}

// ─── Main SuperAdmin Page ─────────────────────────────────────────────────────
export default function SuperAdmin() {
  const { user, isSuperAdmin } = useAuth();
  const [tab, setTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uSnap, cSnap, sSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'classes')),
        getDocs(collection(db, 'subjects')),
      ]);
      setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setClasses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSubjects(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (user && isSuperAdmin) fetchAll(); }, [user, isSuperAdmin]);

  if (!user) return <div className="glass-panel text-center my-8 py-16"><h2>لاگ ان کریں</h2><Link to="/login" className="btn btn-primary mt-6">لاگ ان</Link></div>;

  if (!isSuperAdmin) return (
    <div className="glass-panel text-center animate-fade-in my-8 py-16">
      <AlertTriangle size={64} color="var(--danger)" style={{ margin: '0 auto 1.5rem' }} />
      <h2 style={{ fontSize: '2rem' }}>رسائی ممنوع</h2>
      <p className="text-muted mt-4 text-xl">یہ صفحہ صرف سپر ایڈمن کے لیے ہے۔</p>
    </div>
  );

  const TABS = [
    { id: 'stats', label: 'خلاصہ', icon: <Shield size={18} /> },
    { id: 'users', label: 'صارفین', icon: <Users size={18} /> },
    { id: 'classes', label: 'کلاسز', icon: <GraduationCap size={18} /> },
    { id: 'subjects', label: 'مضامین', icon: <BookOpen size={18} /> },
  ];

  return (
    <div className="animate-fade-in delay-1">
      {/* Header */}
      <div className="glass-panel flex justify-between items-center my-8" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.1))', border: '2px solid var(--secondary-color)' }}>
        <div className="flex items-center gap-4">
          <div style={{ background: 'linear-gradient(135deg, var(--secondary-color), var(--danger))', padding: '0.8rem', borderRadius: '14px' }}>
            <Shield size={32} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>سپر ایڈمن پینل</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: '1rem' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={fetchAll} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}>
          <RefreshCw size={18} /> ریفریش
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8" style={{ flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="btn flex items-center gap-2" style={{
            background: tab === t.id ? 'var(--primary-color)' : 'var(--glass-bg)',
            color: tab === t.id ? '#000' : 'var(--text-main)',
            fontWeight: tab === t.id ? 'bold' : 'normal',
            border: '1px solid var(--glass-border)'
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center text-muted py-12 text-xl">لوڈ ہو رہا ہے...</div>
      ) : (
        <>
          {tab === 'stats' && <StatsTab users={users} classes={classes} subjects={subjects} />}
          {tab === 'users' && <UsersTab users={users} onRefresh={fetchAll} />}
          {tab === 'classes' && <ClassesTab classes={classes} onRefresh={fetchAll} />}
          {tab === 'subjects' && <SubjectsTab subjects={subjects} classes={classes} onRefresh={fetchAll} />}
        </>
      )}
    </div>
  );
}
