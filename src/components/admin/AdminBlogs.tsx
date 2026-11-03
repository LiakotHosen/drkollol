'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  BookOpen,
  Edit3,
  Plus,
  Save,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Calendar,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { BlogPost, Category } from '@/types/database';
import { RichTextEditor } from './RichTextEditor';
import { markdownToHtml, isHtmlString } from '@/lib/markdown-to-html';

interface AdminBlogsProps {
  blogs: BlogPost[];
  categories: Category[];
  onSaveBlog: (blog: BlogPost) => Promise<void>;
}

export function AdminBlogs({ blogs, categories, onSaveBlog }: AdminBlogsProps) {
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (blog: BlogPost) => {
    const contentEn = isHtmlString(blog.content_en)
      ? blog.content_en
      : markdownToHtml(blog.content_en);
    const contentBn = isHtmlString(blog.content_bn)
      ? blog.content_bn
      : markdownToHtml(blog.content_bn);

    setEditingBlog({
      ...blog,
      content_en: contentEn,
      content_bn: contentBn,
    });
    setSaveSuccess(false);
  };

  const handleAddNew = () => {
    const nextId = Math.max(...blogs.map((b) => b.id), 0) + 1;
    const now = new Date().toISOString();
    setEditingBlog({
      id: nextId,
      slug: `new-medical-article-${nextId}`,
      title_en: 'New Medical Article Title',
      title_bn: 'নতুন স্বাস্থ্য প্রবন্ধের শিরোনাম',
      category_slug: categories[0]?.slug || 'colorectal',
      excerpt_en: 'Short summary of the medical insights and surgery advice.',
      excerpt_bn: 'চিকিৎসা পরামর্শ ও অস্ত্রোপচার সংক্রান্ত সারসংক্ষেপ।',
      content_en: '<p>Write comprehensive medical article content here...</p>',
      content_bn: '<p>এখানে সম্পূর্ণ বিস্তারিত বাংলা প্রবন্ধ লিখুন...</p>',
      cover_image: '',
      is_published: true,
      published_at: now,
      reading_time_en: '4 min read',
      reading_time_bn: '৪ মিনিট পঠন',
    });
    setSaveSuccess(false);
  };

  // Upload cover image from local device to /api/admin/upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBlog) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success && json.url) {
        setEditingBlog((prev) => (prev ? { ...prev, cover_image: json.url } : null));
      } else {
        alert(json.message || 'Failed to upload cover image.');
      }
    } catch (err) {
      console.error('Cover upload error:', err);
      alert('Network or server error during cover upload.');
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    setSaving(true);
    try {
      await onSaveBlog(editingBlog);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingBlog(null);
      }, 1000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#062F31]">Medical Articles & Blog Hub</h2>
          <p className="text-xs text-[#062F31]/60">
            Publish clinical surgical guides and patient educational articles with Rich Text Editor & cover photos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B6E73] hover:bg-[#084f53] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {blogs.map((blog) => (
          <div
            key={blog.slug}
            className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md flex flex-col justify-between ${
              blog.is_published ? 'border-[#0B6E73]/15 hover:border-[#2BB3B1]' : 'border-gray-200 opacity-60'
            }`}
          >
            <div>
              {/* Optional Cover Photo Thumbnail */}
              {blog.cover_image ? (
                <div className="relative aspect-[16/8] w-full rounded-xl overflow-hidden mb-3.5 bg-gray-900 border border-gray-100">
                  <Image
                    src={blog.cover_image}
                    alt={blog.title_en}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#062F31]/80 text-white backdrop-blur-xs">
                    Cover Photo
                  </span>
                </div>
              ) : (
                <div className="relative aspect-[16/8] w-full rounded-xl mb-3.5 bg-[#EEF7F6]/60 border border-dashed border-[#0B6E73]/20 flex items-center justify-center text-[#0B6E73]/50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <ImageIcon className="w-4 h-4" />
                    <span>No cover photo added yet</span>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B6E73] bg-[#2BB3B1]/10 px-2 py-0.5 rounded-full">
                  {blog.category_slug}
                </span>
                <button
                  type="button"
                  onClick={() => handleEdit(blog)}
                  className="p-1.5 rounded-lg bg-gray-50 hover:bg-[#EEF7F6] text-[#0B6E73] hover:text-[#062F31] transition-colors cursor-pointer border border-gray-200"
                  title="Edit Article"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-serif font-bold text-base text-[#062F31] line-clamp-1 mb-1">
                {blog.title_en}
              </h3>
              <h4 className="text-xs font-semibold text-gray-600 line-clamp-1 mb-2 font-serif">
                {blog.title_bn}
              </h4>

              <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                {blog.excerpt_en}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                </span>
                <span>•</span>
                <span>{blog.reading_time_en || '4 min read'}</span>
              </div>

              <div>
                {blog.is_published ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <Eye className="w-3 h-3" /> Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-400">
                    <EyeOff className="w-3 h-3" /> Draft
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------------------------------- */}
      {/* EDIT BLOG MODAL (Full Featured Rich Text & Cover Photo) */}
      {/* ---------------------------------------------------------------------------------- */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#EEF7F6] to-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0B6E73]" />
                  <h3 className="font-serif font-bold text-lg text-[#062F31]">
                    {editingBlog.title_en || 'Write Article'}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-0.5">Slug: {editingBlog.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Meta: Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                    className="w-full p-2.5 font-mono rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Clinical Category</label>
                  <select
                    value={editingBlog.category_slug}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category_slug: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1] bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name_en} ({c.name_bn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Article Title (EN) — SEO H1
                  </label>
                  <input
                    type="text"
                    value={editingBlog.title_en}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title_en: e.target.value })}
                    placeholder="e.g. Gallbladder Stone Causes & Laparoscopic Surgery"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1] font-semibold text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    প্রবন্ধের শিরোনাম (BN) — এসইও H1
                  </label>
                  <input
                    type="text"
                    value={editingBlog.title_bn}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title_bn: e.target.value })}
                    placeholder="যেমন: পিত্তথলির পাথর ও ল্যাপারোস্কপিক সার্জারি গাইড"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1] font-serif font-semibold text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* ---------------------------------------------------------------------------------- */}
              {/* COVER PHOTO UPLOAD & PREVIEW */}
              {/* ---------------------------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-[#EEF7F6]/60 border border-[#0B6E73]/20 space-y-3">
                <input
                  type="file"
                  ref={coverFileInputRef}
                  onChange={handleCoverUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#0B6E73]" />
                      <span>Blog Cover Photo (কভার ফটো)</span>
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Upload high-resolution surgical/clinical cover photo from local device (auto-optimized to WebP).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B6E73] hover:bg-[#062F31] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{uploadingCover ? 'Uploading...' : 'Upload from Device'}</span>
                    </button>

                    {editingBlog.cover_image && (
                      <button
                        type="button"
                        onClick={() => setEditingBlog({ ...editingBlog, cover_image: '' })}
                        className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove Cover Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Cover Image Preview */}
                {editingBlog.cover_image ? (
                  <div className="relative aspect-[16/7] w-full rounded-xl overflow-hidden border border-[#0B6E73]/25 bg-gray-900 shadow-sm group">
                    <Image
                      src={editingBlog.cover_image}
                      alt={editingBlog.title_en}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-[#062F31]/80 text-white text-[10px] font-bold backdrop-blur-xs shadow-xs">
                      Active Cover Photo
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#0B6E73]/30 hover:border-[#0B6E73] rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/70 hover:bg-[#EEF7F6]/40"
                  >
                    <UploadCloud className="w-8 h-8 text-[#0B6E73]/50 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-gray-700">Click to select photo from local device</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Supports JPG, PNG, WebP (auto-compressed to high-speed WebP)</p>
                  </div>
                )}

                {/* Direct URL input fallback */}
                <div>
                  <input
                    type="url"
                    value={editingBlog.cover_image || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, cover_image: e.target.value })}
                    placeholder="Or enter direct image URL (https://...)"
                    className="w-full p-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#2BB3B1] bg-white font-mono text-gray-600"
                  />
                </div>
              </div>

              {/* Excerpts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Lead Excerpt (EN) — Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingBlog.excerpt_en}
                    onChange={(e) => setEditingBlog({ ...editingBlog, excerpt_en: e.target.value })}
                    placeholder="Short summary for Google search results and card preview..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1] leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    সারসংক্ষেপ (BN) — মেটা ডেসক্রিপশন
                  </label>
                  <textarea
                    rows={2}
                    value={editingBlog.excerpt_bn}
                    onChange={(e) => setEditingBlog({ ...editingBlog, excerpt_bn: e.target.value })}
                    placeholder="গুগল সার্চ ও সোশ্যাল শেয়ারের জন্য সংক্ষিপ্ত সারসংক্ষেপ..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1] font-serif leading-relaxed"
                  />
                </div>
              </div>

              {/* ---------------------------------------------------------------------------------- */}
              {/* RICH TEXT EDITORS (EN & BN) */}
              {/* ---------------------------------------------------------------------------------- */}
              <div className="pt-2">
                <RichTextEditor
                  label="Full Article Content (English) — Rich Text & HTML Mode"
                  value={editingBlog.content_en}
                  onChange={(html) => setEditingBlog({ ...editingBlog, content_en: html })}
                  placeholder="Write comprehensive English medical article here..."
                  minHeight="320px"
                />
              </div>

              <div className="pt-2">
                <RichTextEditor
                  label="সম্পূর্ণ প্রবন্ধের বিবরণ (বাংলা) — রিচ টেক্সট ও এইচটিএমএল মোড"
                  value={editingBlog.content_bn}
                  onChange={(html) => setEditingBlog({ ...editingBlog, content_bn: html })}
                  placeholder="এখানে সম্পূর্ণ বিস্তারিত বাংলা প্রবন্ধ লিখুন..."
                  minHeight="320px"
                  isBangla
                />
              </div>

              {/* Reading Times & Published Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Reading Time (EN)</label>
                  <input
                    type="text"
                    value={editingBlog.reading_time_en || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, reading_time_en: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">পঠনের সময় (BN)</label>
                  <input
                    type="text"
                    value={editingBlog.reading_time_bn || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, reading_time_bn: e.target.value })}
                    placeholder="যেমন: ৫ মিনিট পঠন"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
                    <input
                      type="checkbox"
                      checked={editingBlog.is_published}
                      onChange={(e) => setEditingBlog({ ...editingBlog, is_published: e.target.checked })}
                      className="w-4 h-4 text-[#0B6E73] rounded focus:ring-[#2BB3B1]"
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0B6E73] hover:bg-[#062F31] text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {saving ? (
                    <span>Saving Article...</span>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span>Saved Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Article</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
