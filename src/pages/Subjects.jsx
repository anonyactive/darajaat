import { useState, useEffect } from 'react';
import { Book, Plus, Trash2, Edit, FileText, Lock, X, Save, Download } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, activeClassId, activeClassName } = useAuth();
  
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
    if (!user) { setLoading(false); return; }
    if (!activeClassId) { setSubjects([]); setLoading(false); return; }
    try {
      const q = query(collection(db, 'subjects'), where('classId', '==', activeClassId));
      const querySnapshot = await getDocs(q);
      setSubjects(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error("Error fetching subjects", error); }
    setLoading(false);
  };

  useEffect(() => { fetchSubjects(); }, [user, activeClassId]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!isAdmin || !activeClassId) return;
    try {
      await addDoc(collection(db, 'subjects'), {
        name: newName,
        bookName: newBooks,
        syllabus: newSyllabus,
        totalPages: parseInt(newPages) || 0,
        readPages: 0,
        classId: activeClassId,
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

  const handleDownloadPDF = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    // Build a hidden HTML table with full Urdu support
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed; top: -9999px; left: -9999px;
      width: 1100px; padding: 40px;
      background: #ffffff; color: #111111;
      font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
      direction: rtl; text-align: right;
    `;

    container.innerHTML = `
      <div style="text-align:center; margin-bottom:24px;">
        <h1 style="font-size:28px; color:#059669; margin:0;">درجات - نصاب رپورٹ</h1>
        <p style="font-size:15px; color:#555; margin:6px 0 0;">کلاس: ${activeClassName || ''} &nbsp;|&nbsp; تاریخ: ${new Date().toLocaleDateString('en-PK')}</p>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:15px;">
        <thead>
          <tr style="background:#059669; color:#fff;">
            <th style="padding:10px 14px; border:1px solid #ddd;">#</th>
            <th style="padding:10px 14px; border:1px solid #ddd;">مضمون</th>
            <th style="padding:10px 14px; border:1px solid #ddd;">کتاب</th>
            <th style="padding:10px 14px; border:1px solid #ddd;">نصاب</th>
            <th style="padding:10px 14px; border:1px solid #ddd;">صفحات</th>
            <th style="padding:10px 14px; border:1px solid #ddd;">پیش رفت</th>
          </tr>
        </thead>
        <tbody>
          ${subjects.map((sub, i) => {
            const progress = sub.totalPages > 0 ? Math.round(((sub.readPages || 0) / sub.totalPages) * 100) : 0;
            const bg = i % 2 === 0 ? '#f0fff8' : '#ffffff';
            return `<tr style="background:${bg};">
              <td style="padding:10px 14px; border:1px solid #ddd; text-align:center;">${i + 1}</td>
              <td style="padding:10px 14px; border:1px solid #ddd;">${sub.name || '-'}</td>
              <td style="padding:10px 14px; border:1px solid #ddd;">${sub.bookName || '-'}</td>
              <td style="padding:10px 14px; border:1px solid #ddd;">${sub.syllabus || '-'}</td>
              <td style="padding:10px 14px; border:1px solid #ddd; text-align:center;">${sub.readPages || 0} / ${sub.totalPages || 0}</td>
              <td style="padding:10px 14px; border:1px solid #ddd; text-align:center; font-weight:bold; color:#059669;">${progress}%</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgH = pageW / ratio;
      
      // If content is taller than one page, split across pages
      let pos = 0;
      while (pos < imgH) {
        if (pos > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -pos, pageW, imgH);
        pos += pageH;
      }

      pdf.save(`Darajaat-${activeClassName || 'Syllabus'}.pdf`);
    } finally {
      document.body.removeChild(container);
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

  if (!activeClassId) {
    return (
      <div className="glass-panel text-center animate-fade-in my-8 py-16">
        <Book size={64} className="mx-auto opacity-30 mb-4" />
        <h2 style={{ fontSize: '2rem' }}>پہلے کوئی کلاس منتخب کریں</h2>
        <p className="text-muted mt-4 text-xl">نصاب دیکھنے کے لیے ایک کلاس جوائن یا منتخب کریں۔</p>
        <Link to="/classes" className="btn btn-primary mt-6">کلاسز دیکھیں</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in delay-2">
      {/* Edit Modal */}
      {editingSubject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--surface-color)', maxHeight: '90vh', overflowY: 'auto' }}>
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

      <div className="flex justify-between items-center my-8" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>مضامین</h2>
          <p className="text-muted" style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>کلاس: {activeClassName}</p>
        </div>
        <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
          <button onClick={handleDownloadPDF} className="btn" style={{ background: 'var(--secondary-color)', color: '#fff', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
            <Download size={20} /> PDF محفوظ کریں
          </button>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={20} /> {showAddForm ? 'منسوخ کریں' : 'نیا مضمون'}
            </button>
          )}
        </div>
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
                    <h3 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', margin: 0, lineHeight: 1.4 }}>
                      <div style={{ background: 'var(--glass-border)', padding: '0.5rem', borderRadius: '10px', flexShrink: 0 }}>
                        <Book size={24} color="var(--primary-color)" />
                      </div>
                      {sub.name}
                    </h3>
                    {isAdmin && (
                      <div className="flex gap-4" style={{ flexShrink: 0 }}>
                        <button onClick={() => openEditModal(sub)} title="ترمیم کریں" style={{ background: 'transparent', border: 'none', color: 'var(--secondary-color)', cursor: 'pointer' }}><Edit size={20} /></button>
                        <button onClick={() => handleDelete(sub.id)} title="حذف کریں" style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={20} /></button>
                      </div>
                    )}
                  </div>
                  <div className="flex-col gap-2 mb-4">
                    {sub.bookName && (
                      <div className="flex items-center gap-2 text-muted" style={{ fontSize: '1rem' }}>
                        <Book size={14} /> <span>{sub.bookName}</span>
                      </div>
                    )}
                    {sub.syllabus && (
                      <div className="flex items-start gap-2 text-muted mt-2" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        <FileText size={14} style={{ flexShrink: 0, marginTop: '4px' }} />
                        <span>{sub.syllabus}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted" style={{ fontSize: '1rem' }}>{readPages} / {sub.totalPages || 0} صفحات</span>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1rem' }}>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, background: progress === 100 ? '#fbbf24' : 'var(--primary-color)', height: '100%', borderRadius: '5px', transition: 'width 1s ease' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
          {subjects.length === 0 && (
            <p className="text-muted text-center w-full mt-8" style={{ gridColumn: '1 / -1', fontSize: '1.2rem' }}>
              اس کلاس میں کوئی مضمون نہیں۔ {isAdmin ? 'ابھی شامل کریں!' : 'ایڈمن سے رابطہ کریں۔'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
