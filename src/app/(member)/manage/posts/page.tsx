'use client';
import React, { useState, useEffect } from 'react';

export default function ManagePostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', published: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/posts/${editingId}` : '/api/posts';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', content: '', published: true });
        setEditingId(null);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบประกาศนี้?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-12 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">จัดการข่าวสาร/ประกาศ</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">เพิ่ม ลบ แก้ไข ประกาศในระบบ</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ title: '', content: '', published: true });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          เพิ่มประกาศใหม่
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                <th className="px-4 py-3 font-medium">หัวข้อ</th>
                <th className="px-4 py-3 font-medium">ผู้เขียน</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">วันที่สร้าง</th>
                <th className="px-4 py-3 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{post.title}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">{post.author?.firstName} {post.author?.lastName}</td>
                  <td className="px-4 py-3 text-sm">
                    {post.published ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-medium">เผยแพร่</span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-medium">ฉบับร่าง</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">
                    {new Date(post.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => {
                        setFormData({ title: post.title, content: post.content, published: post.published });
                        setEditingId(post.id);
                        setIsModalOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors mr-2"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'แก้ไขประกาศ' : 'เพิ่มประกาศใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">หัวข้อประกาศ</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เนื้อหา</label>
                <textarea 
                  required
                  rows={6}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                ></textarea>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="published"
                  checked={formData.published}
                  onChange={e => setFormData({...formData, published: e.target.checked})}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <label htmlFor="published" className="ml-2 text-sm text-slate-700 dark:text-slate-300">เผยแพร่ทันที</label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-colors">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
