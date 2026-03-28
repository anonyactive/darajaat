import { useState, useEffect } from 'react';
import { Book, Plus, Trash2, Edit, FileText, Lock, X, Save } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  
  // Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBooks, setNewBooks] = useState('');
  const [newSyllabus, setNewSyllabus] = useState('');
  const [newPages, setNewPages] = useState('');

  // Edit Modal State
  const [editingSubject, setEditingSubject] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBooks, setEditBooks] = useState('');
  const [editSyllabus, setEditSyllabus] = useState('');
  const [editPages, setEditPages] = useState('');
  const [editReadPages, setEditReadPages] = useState('');

  const fetchSubjects = async () => {
    if (!auth.app.options.apiKey || auth.app.options.apiKey === 'YOUR_API_KEY') {
      setSubjects([{ id: 1, name: 'قرآن مجید (تفسیر) - (فرضی ڈیٹا)', booksCount: 2, totalPages: 500, readPages: 225 }]);
      setLoading(false);
      return;
    }
    if (!user) { setLoading(false); return; }
    try {
      const querySnapshot = await getDocs(collection(db, 'subjects'));
      setSubjects(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error("Error fetching subjects", error); }
    setLoading(false);
  };

  useEffect(() => { fetchSubjects(); }, [user]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'subjects'), {
        name: newName,
        bookName: newBooks,
        syllabus: newSyllabus,
        totalPages: parseInt(newPages) || 0,
        readPages: 0,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setShowAddForm(false);
      setNewName(''); setNewBooks(''); setNewSyllabus(''); setNewPages('');
      fetchSubjects();
    } catch (error) { console.error("Error adding subject", error); }
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setEditName(sub.name || '');
    setEditBooks(sub.bookName || '');
    setEditSyllabus(sub.syllabus || '');
    setEditPages(sub.totalPages || '');
    setEditReadPages(sub.readPages || '');
  };

  const handleEditSave = async () => {
    if (!editingSubject || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'subjects', editingSubject.id), {
        name: editName,
        bookName: editBooks,
        syllabus: editSyllabus,
        totalPages: parseInt(editPages) || 0,
        readPages: parseInt(editReadPages) || 0,
      });
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) { console.error("Error updating subject", error); }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (window.confirm("کیا آپ واقعی اس مضمون کو حذف کرنا چاہتے ہیں؟")) {
      await deleteDoc(doc(db, 'subjects', id));
      fetchSubjects();
    }
  };

  if (!user) {
    return (
      <div className="glass-panel text-center animate-fade-in my-8 p-8 py-16">
        <Lock size={64} className="mx-auto text-muted mb-4 opacity-50" />
        <h2 style={{ fontSize: '2rem' }}>نصاب دیکھنے کے لیے لاگ ان کریں</h2>
        <Link to="/login" className="btn btn-primary mt-6">لاگ ان کریں</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in delay-2">
      {/* Edit Modal */}
      {editingSubject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--surface-color)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '1.8rem', margin: 0 }}>مضمون تبدیل کریں</h3>
              <button onClick={() => setEditingSubject(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div className="flex-col gap-4">
              <div>
                <label className="text-muted block mb-2">مضمون کا نام</label>
                <input type="text" className="input-field" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="mt-4">
                <label className="text-muted block mb-2">کتاب کا نام</label>
                <input type="text" className="input-field" value={editBooks} onChange={e => setEditBooks(e.target.value)} />
              </div>
              <div className="mt-4">
                <label className="text-muted block mb-2">نصاب (Syllabus)</label>
                <textarea className="input-field" rows={3} style={{ resize: 'vertical', lineHeight: '1.6' }} placeholder="نصاب کی تفصیل درج کریں..." value={editSyllabus} onChange={e => setEditSyllabus(e.target.value)} />
              </div>
              <div className="mt-4">
                <label className="text-muted block mb-2">کل صفحات</label>
                <input type="number" className="input-field" value={editPages} onChange={e => setEditPages(e.target.value)} />
              </div>
              <div className="mt-4">
                <label className="text-muted block mb-2">پڑھے گئے صفحات</label>
                <input type="number" className="input-field" value={editReadPages} onChange={e => setEditReadPages(e.target.value)} />
              </div>
              <div className="flex gap-4 mt-6">
                <button className="btn btn-primary flex items-center gap-2" onClick={handleEditSave} style={{ flex: 1 }}>
                  <Save size={18} /> محفوظ کریں
                </button>
                <button className="btn btn-danger" onClick={() => setEditingSubject(null)}>منسوخ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center my-8">
        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>مضامین اور نصاب</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={20} /> {showAddForm ? 'منسوخ کریں' : 'نیا مضمون'}
          </button>
        )}
      </div>

      {showAddForm && isAdmin && (
        <div className="glass-panel mb-8 animate-fade-in" style={{ border: '2px dashed var(--primary-color)' }}>
          <h3 className="mb-4" style={{ fontSize: '1.4rem' }}>نیا مضمون شامل کریں</h3>
          <form onSubmit={handleAddSubject} className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <input type="text" placeholder="مضمون کا نام" className="input-field" style={{ flex: '1 1 200px' }} value={newName} onChange={e => setNewName(e.target.value)} required />
            <input type="text" placeholder="کتاب کا نام" className="input-field" style={{ flex: '1 1 150px' }} value={newBooks} onChange={e => setNewBooks(e.target.value)} />
            <input type="text" placeholder="نصاب مثلاً: باب 1 تا 5" className="input-field" style={{ flex: '2 1 200px' }} value={newSyllabus} onChange={e => setNewSyllabus(e.target.value)} />
            <input type="number" placeholder="کل صفحات" className="input-field" style={{ flex: '1 1 120px' }} value={newPages} onChange={e => setNewPages(e.target.value)} required />
            <button type="submit" className="btn btn-primary">محفوظ کریں</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted text-xl py-12">لوڈ ہو رہا ہے...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {subjects.map(sub => {
            const readPages = sub.readPages || 0;
            const progress = sub.totalPages > 0 ? Math.round((readPages / sub.totalPages) * 100) : 0;
            return (
              <div key={sub.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, lineHeight: 1.4 }}>
                      <div style={{ background: 'var(--glass-border)', padding: '0.5rem', borderRadius: '10px', flexShrink: 0 }}>
                        <Book size={24} color="var(--primary-color)" />
                      </div>
                      {sub.name}
                    </h3>
                    {isAdmin && (
                      <div className="flex gap-4" style={{ flexShrink: 0, marginRight: '0.5rem' }}>
                        <button onClick={() => openEditModal(sub)} title="ترمیم کریں" style={{ background: 'transparent', border: 'none', color: 'var(--secondary-color)', cursor: 'pointer', transition: 'color 0.2s' }}><Edit size={20} /></button>
                        <button onClick={() => handleDelete(sub.id)} title="حذف کریں" style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', transition: 'color 0.2s' }}><Trash2 size={20} /></button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 mt-4 mb-6">
                    <span className="text-muted flex items-center gap-2" style={{ fontSize: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.8rem', borderRadius: '20px' }}>
                      <Book size={16} /> {sub.booksCount || 0} کتب
                    </span>
                    <span className="text-muted flex items-center gap-2" style={{ fontSize: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.8rem', borderRadius: '20px' }}>
                      <FileText size={16} /> {readPages} / {sub.totalPages || 0} صفحات
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-2 text-muted" style={{ fontSize: '1rem' }}>
                    <span>پیش رفت</span>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, background: 'var(--primary-color)', height: '100%', borderRadius: '5px', transition: 'width 1s ease' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
          {subjects.length === 0 && (
            <p className="text-muted text-center w-full mt-8" style={{ gridColumn: '1 / -1', fontSize: '1.2rem' }}>
              کوئی مضمون موجود نہیں۔ ابھی شامل کریں!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
