import React, { useState, useEffect } from 'react';
import { Book, Category, Author } from '../../types/index.js';
import { Modal } from '../common/Modal.js';
import { SearchableSelect } from '../common/SearchableSelect.js';
import { MultiSelect } from '../common/MultiSelect.js';
import { DatePicker } from '../common/DatePicker.js';
import { Upload, Crown, Star } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Book>) => Promise<void>;
  initialData?: Book | null;
  categories: Category[];
  authors: Author[];
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  authors
}) => {
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('29.99');
  const [originalPrice, setOriginalPrice] = useState('39.99');
  const [stock, setStock] = useState('25');
  const [pages, setPages] = useState('320');
  const [publicationDate, setPublicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['Programming', 'Best Practices']);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVipExclusive, setIsVipExclusive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setIsbn(initialData.isbn);
      setAuthorId(initialData.authorId);
      setCategoryId(initialData.categoryId);
      setPrice(String(initialData.price));
      setOriginalPrice(initialData.originalPrice ? String(initialData.originalPrice) : '');
      setStock(String(initialData.stock));
      setPages(String(initialData.pages));
      setPublicationDate(initialData.publicationDate || new Date().toISOString().split('T')[0]);
      setCoverImage(initialData.coverImage);
      setDescription(initialData.description || '');
      setTags(initialData.tags || []);
      setIsFeatured(Boolean(initialData.isFeatured));
      setIsVipExclusive(Boolean(initialData.isVipExclusive));
    } else {
      setTitle('');
      setIsbn(`978-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setAuthorId(authors[0]?.id || '');
      setCategoryId(categories[0]?.id || '');
      setPrice('34.99');
      setOriginalPrice('45.00');
      setStock('30');
      setPages('350');
      setPublicationDate(new Date().toISOString().split('T')[0]);
      setCoverImage('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80');
      setDescription('');
      setTags(['Best Practices', 'Software Engineering']);
      setIsFeatured(false);
      setIsVipExclusive(false);
    }
  }, [initialData, isOpen, categories, authors]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/system/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setCoverImage(res.data.file.url);
        addToast('Cover image uploaded successfully!', 'success');
      }
    } catch {
      // Fallback to local object URL
      const localUrl = URL.createObjectURL(file);
      setCoverImage(localUrl);
      addToast('Image loaded preview locally.', 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !isbn || !authorId || !categoryId || !price) {
      addToast('Please fill in all mandatory fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const author = authors.find(a => a.id === authorId);
      const category = categories.find(c => c.id === categoryId);

      await onSubmit({
        title,
        isbn,
        authorId,
        authorName: author?.name || 'Author',
        categoryId,
        categoryName: category?.name || 'Category',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        stock: parseInt(stock, 10),
        pages: parseInt(pages, 10),
        publicationDate,
        coverImage,
        description,
        tags,
        isFeatured,
        isVipExclusive
      });
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Error saving book.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tagOptions = [
    'Programming', 'Clean Code', 'Agile', 'Refactoring', 'Testing',
    'Architecture', 'Sci-Fi', 'Classics', 'Startups', 'Psychology',
    'Habits', 'Space Opera', 'Cyberpunk', 'JavaScript', 'TypeScript'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Book: ${initialData.title}` : 'Add New Book to Catalog'}
      maxWidth="xl"
      testId="book-form-modal"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            data-testid="book-form-cancel-btn"
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-testid="book-form-submit-btn"
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Book'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs" data-testid="book-form">
        {/* Title & ISBN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean Architecture"
              data-testid="book-form-title-input"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              ISBN <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="e.g. 978-0134494166"
              data-testid="book-form-isbn-input"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        {/* Category & Author Searchable Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SearchableSelect
            label="Category"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            value={categoryId}
            onChange={setCategoryId}
            placeholder="Select category"
            testId="book-form-category-select"
          />
          <SearchableSelect
            label="Author"
            options={authors.map(a => ({ value: a.id, label: a.name }))}
            value={authorId}
            onChange={setAuthorId}
            placeholder="Select author"
            testId="book-form-author-select"
          />
        </div>

        {/* Price, Original Price, Stock, Pages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Price ($) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              data-testid="book-form-price-input"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              List Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              data-testid="book-form-orig-price-input"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Stock Units
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              data-testid="book-form-stock-input"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Pages
            </label>
            <input
              type="number"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              data-testid="book-form-pages-input"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Publication Date using DatePicker */}
        <div>
          <DatePicker
            label="Publication Date"
            value={publicationDate}
            onChange={setPublicationDate}
            testId="book-form-pubdate"
          />
        </div>

        {/* Cover Image URL & File Upload preview */}
        <div>
          <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Cover Image URL & Upload
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              data-testid="book-form-cover-input"
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label
              data-testid="book-form-upload-label"
              className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-semibold"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                data-testid="book-form-file-input"
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Tags Multi-select */}
        <MultiSelect
          label="Book Tags & Keywords"
          options={tagOptions}
          selected={tags}
          onChange={setTags}
          testId="book-form-tags-select"
        />

        {/* Description Textarea with Character Counter */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold text-slate-300 uppercase tracking-wider">
              Description
            </label>
            <span className="text-[10px] text-slate-500" data-testid="desc-char-count">
              {description.length} characters
            </span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed book summary, themes, target audience..."
            data-testid="book-form-desc-textarea"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Toggles: Featured & VIP */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              data-testid="book-form-featured-checkbox"
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Bestseller / Featured</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={isVipExclusive}
              onChange={(e) => setIsVipExclusive(e.target.checked)}
              data-testid="book-form-vip-checkbox"
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-rose-400" />
              <span>VIP Exclusive Title</span>
            </span>
          </label>
        </div>
      </form>
    </Modal>
  );
};
