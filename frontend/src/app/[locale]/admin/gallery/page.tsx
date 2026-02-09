'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Star } from 'lucide-react';
import Image from 'next/image';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    title: '',
    description: '',
    category: 'events',
    imageUrl: '',
    tags: [],
    featured: false
  });
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/v1/gallery');
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    }
  };

  const handleOpenModal = (item?: GalleryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
      setTagsInput(item.tags.join(', '));
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        category: 'events',
        imageUrl: '',
        tags: [],
        featured: false
      });
      setTagsInput('');
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const res = await fetch(`http://localhost:3005/api/v1/gallery/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchItems();
        } else {
          console.error('Failed to delete item:', res.status);
          alert(`Failed to delete item: ${res.status}`);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Check console for details.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingItem 
      ? `http://localhost:3005/api/v1/gallery/${editingItem.id}` 
      : 'http://localhost:3005/api/v1/gallery';
    
    const method = editingItem ? 'PATCH' : 'POST';

    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const finalData = { ...formData, tags: tagsArray };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchItems();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to save item:', res.status, errorData);
        alert(`Failed to save item: ${res.status} ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item. Check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Manage Gallery</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Preview</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Title</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Featured</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="relative w-16 h-12 rounded overflow-hidden bg-gray-100">
                    <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 uppercase text-xs font-semibold">{item.category}</td>
                <td className="px-6 py-4">
                  {item.featured ? (
                    <span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold ring-1 ring-inset ring-yellow-600/20">
                      <Star size={12} fill="currentColor" /> Featured
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Standard</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg h-24"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="events">Events</option>
                    <option value="performances">Performances</option>
                    <option value="studios">Studios</option>
                    <option value="teachers">Teachers</option>
                    <option value="instruments">Instruments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="concert, piano, 2024"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="featured"
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Mark as Featured</label>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
