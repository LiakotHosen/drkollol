'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link2,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Code2,
  Eye,
  UploadCloud,
  Check,
  X,
  Type,
  FileCode2,
} from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize-html';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  isBangla?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'Write comprehensive medical article content here...',
  minHeight = '360px',
  isBangla = false,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [isUploading, setIsUploading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  const visualRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalChange = useRef(false);

  // Sync value from props to contentEditable element
  useEffect(() => {
    if (visualRef.current && mode === 'visual') {
      if (!isInternalChange.current) {
        // Only update innerHTML if it actually differs to avoid resetting cursor
        if (visualRef.current.innerHTML !== value) {
          visualRef.current.innerHTML = value || '';
        }
      }
      isInternalChange.current = false;
    }
  }, [value, mode]);

  // Handle content changes in visual editor
  const handleVisualInput = useCallback(() => {
    if (!visualRef.current) return;
    const html = visualRef.current.innerHTML;
    isInternalChange.current = true;
    onChange(html);
  }, [onChange]);

  // Execute standard formatting commands
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (mode !== 'visual') return;
    if (visualRef.current) {
      visualRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleVisualInput();
  };

  // Format block (Paragraph, H1, H2, H3, H4)
  const formatHeading = (tag: 'p' | 'h1' | 'h2' | 'h3' | 'h4') => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  // Save selection before opening modal
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0));
      setLinkText(sel.toString());
    }
  };

  // Restore selection
  const restoreSelection = () => {
    if (savedSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelection);
      }
    }
  };

  // Open Link Modal
  const handleOpenLinkModal = () => {
    saveSelection();
    setLinkUrl('');
    setLinkModalOpen(true);
  };

  // Insert Link
  const handleInsertLink = () => {
    restoreSelection();
    if (linkUrl.trim()) {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\/|^\/|^mailto:|^tel:/i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }

      if (savedSelection && !savedSelection.collapsed) {
        document.execCommand('createLink', false, finalUrl);
      } else {
        const textToInsert = linkText.trim() || finalUrl;
        const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-[#0B6E73] underline font-semibold hover:text-[#062F31]">${textToInsert}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      }
      handleVisualInput();
    }
    setLinkModalOpen(false);
  };

  // Insert Custom Callout / Blockquote
  const handleInsertQuote = () => {
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : '';
    const text = selectedText || (isBangla ? 'এখানে সার্জিক্যাল পরামর্শ বা গুরুত্বপূর্ণ তথ্য লিখুন...' : 'Key surgical advice or medical takeaway...');
    const quoteHtml = `<blockquote class="doctor-callout my-4 p-4 rounded-2xl bg-gradient-to-r from-[#EEF7F6] to-white border-l-4 border-[#0B6E73] text-[#062F31] italic shadow-xs flex items-start gap-2.5"><span class="text-xl text-[#0B6E73] font-serif leading-none select-none">❝</span><div class="leading-relaxed flex-1">${text}</div></blockquote><p><br></p>`;
    document.execCommand('insertHTML', false, quoteHtml);
    handleVisualInput();
  };

  // Insert Responsive Table
  const handleInsertTable = () => {
    const tableHtml = `
      <div class="table-responsive my-5 overflow-x-auto">
        <table class="w-full text-xs sm:text-sm border-collapse border border-[#0B6E73]/20 rounded-xl overflow-hidden shadow-2xs">
          <thead>
            <tr class="bg-[#EEF7F6] text-[#062F31] font-bold border-b border-[#0B6E73]/20">
              <th class="p-3 text-left">পর্যায় / বিষয় (Phase)</th>
              <th class="p-3 text-left">লক্ষণ ও বিবরণ (Details)</th>
              <th class="p-3 text-left">চিকিৎসা ও পরামর্শ (Guidance)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-100 hover:bg-gray-50/50">
              <td class="p-3">প্রাথমিক ধাপ</td>
              <td class="p-3">সামান্য অস্বস্তি বা ব্যথা</td>
              <td class="p-3">জীবনযাত্রার পরিবর্তন ও পরামর্শ</td>
            </tr>
            <tr class="border-b border-gray-100 hover:bg-gray-50/50">
              <td class="p-3">মধ্যবর্তী ধাপ</td>
              <td class="p-3">ক্রমাগত তীব্রতা বৃদ্ধি</td>
              <td class="p-3">বিশেষজ্ঞ সার্জনকে দেখানো</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
    handleVisualInput();
  };

  // Handle local image file upload into editor
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success && json.url) {
        if (visualRef.current) {
          visualRef.current.focus();
        }
        const imgHtml = `<figure class="my-6 text-center"><img src="${json.url}" alt="${file.name.replace(/\.[^/.]+$/, '')}" class="rounded-2xl mx-auto shadow-md max-h-[500px] w-auto border border-[#0B6E73]/15" loading="lazy" /><figcaption class="text-xs text-gray-500 mt-2 italic">${isBangla ? 'ছবির ক্যাপশন এখানে লিখুন' : 'Image caption here'}</figcaption></figure><p><br></p>`;
        document.execCommand('insertHTML', false, imgHtml);
        handleVisualInput();
      } else {
        alert(json.message || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Network or server error during image upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Toggle Mode (Visual <-> HTML)
  const toggleMode = (targetMode: 'visual' | 'html') => {
    if (targetMode === mode) return;

    if (targetMode === 'html') {
      // Switching to HTML mode: get innerHTML from visual editor and sanitize
      if (visualRef.current) {
        const clean = sanitizeHtml(visualRef.current.innerHTML);
        onChange(clean);
      }
    } else {
      // Switching to Visual mode: sanitize current value and assign
      const clean = sanitizeHtml(value);
      onChange(clean);
      setTimeout(() => {
        if (visualRef.current) {
          visualRef.current.innerHTML = clean;
        }
      }, 0);
    }
    setMode(targetMode);
  };

  // Word & character stats
  const cleanText = (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const charCount = cleanText.length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="space-y-1.5">
      {/* Top Header / Mode Switcher */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block font-semibold text-gray-700 text-xs">
            {label}
          </label>
        )}

        <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-xl text-xs font-semibold ml-auto">
          <button
            type="button"
            onClick={() => toggleMode('visual')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              mode === 'visual'
                ? 'bg-white text-[#0B6E73] shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visual Editor</span>
          </button>
          <button
            type="button"
            onClick={() => toggleMode('html')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              mode === 'html'
                ? 'bg-[#062F31] text-white shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>HTML Source</span>
          </button>
        </div>
      </div>

      {/* Editor Main Container */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-xs focus-within:border-[#2BB3B1] focus-within:ring-2 focus-within:ring-[#2BB3B1]/20 transition-all">
        {/* Hidden File Input for Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />

        {/* ---------------------------------------------------------------------------------- */}
        {/* TOOLBAR (Visual Mode) */}
        {/* ---------------------------------------------------------------------------------- */}
        {mode === 'visual' && (
          <div className="border-b border-gray-100 bg-[#F8FAFA] p-2 flex items-center flex-wrap gap-1 text-gray-700 select-none">
            {/* History */}
            <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-200">
              <button
                type="button"
                onClick={() => executeCommand('undo')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('redo')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-gray-200">
              <button
                type="button"
                onClick={() => formatHeading('p')}
                className="px-2 py-1 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors text-xs font-semibold"
                title="Normal Paragraph"
              >
                P
              </button>
              <button
                type="button"
                onClick={() => formatHeading('h2')}
                className="px-2 py-1 hover:bg-white text-[#0B6E73] hover:bg-[#EEF7F6] rounded-lg transition-colors text-xs font-bold"
                title="Heading 2 (Major Section - SEO Optimal)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => formatHeading('h3')}
                className="px-2 py-1 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors text-xs font-bold"
                title="Heading 3 (Sub-section)"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => formatHeading('h4')}
                className="px-2 py-1 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors text-xs font-bold"
                title="Heading 4 (Minor Topic)"
              >
                H4
              </button>
            </div>

            {/* Inline Formatting */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-gray-200">
              <button
                type="button"
                onClick={() => executeCommand('bold')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors font-bold"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('italic')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors italic"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('underline')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors underline"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('strikeThrough')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors"
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-gray-200">
              <button
                type="button"
                onClick={() => executeCommand('justifyLeft')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyCenter')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyRight')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            {/* Lists & Quotes */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-gray-200">
              <button
                type="button"
                onClick={() => executeCommand('insertUnorderedList')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('insertOrderedList')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleInsertQuote}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors text-amber-700"
                title="Medical Callout Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>

            {/* Inserts: Links, Images, Tables, Dividers */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-gray-200">
              <button
                type="button"
                onClick={handleOpenLinkModal}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors text-blue-600"
                title="Insert Link"
              >
                <Link2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('unlink')}
                className="p-1.5 hover:bg-white hover:text-rose-600 rounded-lg transition-colors"
                title="Remove Link"
              >
                <Unlink className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors text-emerald-700 disabled:opacity-50"
                title="Insert Image (Upload from Local Device)"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors text-indigo-600"
                title="Insert Medical Table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('insertHorizontalRule')}
                className="p-1.5 hover:bg-white hover:text-[#0B6E73] rounded-lg transition-colors"
                title="Horizontal Divider"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Clear Formatting */}
            <div className="flex items-center gap-0.5 pl-1.5 ml-auto">
              <button
                type="button"
                onClick={() => executeCommand('removeFormat')}
                className="p-1.5 hover:bg-white hover:text-rose-600 rounded-lg transition-colors text-gray-400"
                title="Clear Formatting"
              >
                <RemoveFormatting className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Status Banner */}
        {isUploading && (
          <div className="px-4 py-2 bg-[#EEF7F6] text-[#0B6E73] text-xs font-semibold flex items-center gap-2 animate-pulse border-b border-[#0B6E73]/15">
            <UploadCloud className="w-4 h-4 animate-bounce" />
            <span>Optimizing and uploading image to secure storage...</span>
          </div>
        )}

        {/* ---------------------------------------------------------------------------------- */}
        {/* EDITING AREA */}
        {/* ---------------------------------------------------------------------------------- */}
        {mode === 'visual' ? (
          <div
            ref={visualRef}
            contentEditable
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className={`p-4 sm:p-5 outline-none overflow-y-auto text-base text-[#062F31] leading-[1.8] tracking-normal selection:bg-[#2BB3B1]/20 font-serif prose prose-teal max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:font-serif [&_h1]:text-[#062F31] [&_h1]:my-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:font-serif [&_h2]:text-[#062F31] [&_h2]:border-l-4 [&_h2]:border-[#0B6E73] [&_h2]:pl-3.5 [&_h2]:my-3.5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:font-serif [&_h3]:text-[#0B6E73] [&_h3]:my-3 [&_blockquote]:bg-[#EEF7F6]/60 [&_blockquote]:border-l-4 [&_blockquote]:border-[#0B6E73] [&_blockquote]:p-3.5 [&_blockquote]:rounded-r-xl [&_blockquote]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_p]:my-2.5 [&_a]:text-[#0B6E73] [&_a]:underline [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_th]:border [&_th]:border-gray-200 [&_th]:p-2 [&_th]:bg-gray-50 [&_td]:border [&_td]:border-gray-200 [&_td]:p-2`}
          />
        ) : (
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{ minHeight }}
              placeholder="<!-- Write or edit standard HTML here -->"
              className="w-full p-4 font-mono text-xs sm:text-sm text-gray-800 bg-[#FAFBFB] outline-none leading-relaxed resize-y block border-none focus:ring-0"
              spellCheck={false}
            />
          </div>
        )}

        {/* ---------------------------------------------------------------------------------- */}
        {/* BOTTOM STATS FOOTER */}
        {/* ---------------------------------------------------------------------------------- */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between text-[11px] text-gray-500 font-medium">
          <div className="flex items-center gap-3">
            <span>
              {isBangla ? 'শব্দ সংখ্যা:' : 'Words:'}{' '}
              <b className="text-gray-700">{wordCount}</b>
            </span>
            <span>•</span>
            <span>
              {isBangla ? 'অক্ষর:' : 'Characters:'}{' '}
              <b className="text-gray-700">{charCount}</b>
            </span>
            <span>•</span>
            <span>
              ⏱ ~{readingTimeMin} {isBangla ? 'মিনিট পঠন' : 'min read'}
            </span>
          </div>

          <div className="text-[10px] text-[#0B6E73] font-semibold uppercase tracking-wider">
            {mode === 'visual' ? 'WYSIWYG Mode' : 'Raw HTML Mode'}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------------------- */}
      {/* INSERT LINK MODAL */}
      {/* ---------------------------------------------------------------------------------- */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-[#062F31]">
                <Link2 className="w-4 h-4 text-[#0B6E73]" />
                <h4 className="font-bold text-sm">
                  {isBangla ? 'লিংক যুক্ত করুন' : 'Insert Web Hyperlink'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isBangla ? 'লিংকের টেক্সট (ঐচ্ছিক)' : 'Display Text (Optional)'}
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Learn more about piles surgery"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isBangla ? 'ওয়েব ইউআরএল (URL)' : 'Destination URL (https://...)'}
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/medical-study"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2BB3B1]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-1.5 rounded-xl bg-[#0B6E73] hover:bg-[#062F31] text-white text-xs font-bold transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
