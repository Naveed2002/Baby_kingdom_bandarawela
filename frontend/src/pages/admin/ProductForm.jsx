import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';

const AddProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const categories = ['Baby Clothing', 'Accessories', 'Gift', 'Toys', 'Care Products'];
  const ageGroups = ['0-3 months', '3-6 months', '6-9 months', '9-12 months', '1yr-2yr', '2yr-3yr'];

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    ageGroup: '',
    price: '',
    originalPrice: '',
    stock: '',
    description: '',
    tags: [],
    images: [],
    mainImage: '',
    isFeatured: false,
    newTag: ''
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        const res = await axios.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        const p = res.data;
        setFormData({
          name: p.name || '',
          category: p.category || '',
          ageGroup: p.ageGroup || '',
          price: p.price ?? '',
          originalPrice: p.originalPrice ?? '',
          stock: p.stock ?? '',
          description: p.description || '',
          tags: Array.isArray(p.tags) ? p.tags : [],
          images: Array.isArray(p.images) ? p.images : [],
          mainImage: p.mainImage || '',
          isFeatured: !!p.isFeatured,
          newTag: ''
        });
      } catch (err) {
        console.error(err);
        alert('Failed to load product');
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [isEdit, id]);

  // Handle input change
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add a new keyword/tag
  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, formData.newTag.trim()],
        newTag: ''
      }));
    }
  };

  // Remove tag
  const handleRemoveTag = tag => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Image upload
  const handleImageUpload = async e => {
    const files = e.target.files;
    if (!files.length) return;

    try {
      setUploading(true);
      const newImages = [];

      for (let file of files) {
        const data = new FormData();
        data.append('image', file);
        const res = await axios.post(API_ENDPOINTS.UPLOAD, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newImages.push(res.data.filePath);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
        mainImage: prev.mainImage || newImages[0]
      }));
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const removeImage = path => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== path),
      mainImage: prev.mainImage === path ? prev.images[0] || '' : prev.mainImage
    }));
  };

  // Submit form
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price || !formData.stock || !formData.images.length) {
      return alert('Please fill all required fields and upload at least one image.');
    }

    try {
      setSaving(true);
      const productData = { ...formData };
      if (isEdit) {
        await axios.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, productData);
        alert('Product updated successfully!');
        navigate('/admin/products');
        return;
      } else {
        await axios.post(API_ENDPOINTS.PRODUCTS, productData);
        alert('Product added successfully!');
        setFormData({
          name: '',
          category: '',
          ageGroup: '',
          price: '',
          originalPrice: '',
          stock: '',
          description: '',
          tags: [],
          images: [],
          mainImage: '',
          isFeatured: false,
          newTag: ''
        });
      }
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || (isEdit ? 'Failed to update product' : 'Failed to add product'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 w-full"
            required
          />

          {/* Category Dropdown */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 w-full"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Age Group Dropdown */}
          <select
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="">Select Age Group</option>
            {ageGroups.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>

          <input
            type="number"
            name="stock"
            placeholder="Stock Quantity"
            value={formData.stock}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 w-full"
            required
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 w-full"
            required
          />
          <input
            type="number"
            name="originalPrice"
            placeholder="Selling Price / Original Price"
            value={formData.originalPrice}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        {/* Description */}
        <textarea
          name="description"
          placeholder="Product Description"
          value={formData.description}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 w-full h-24"
        />

        {/* Keywords / Tags */}
        <div>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              name="newTag"
              placeholder="Add Keyword / Tag"
              value={formData.newTag}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 flex-1 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <div key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center space-x-2">
                <span>{tag}</span>
                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-red-500 font-bold">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="h-5 w-5 text-blue-500"
          />
          <label className="text-gray-700">Featured Product</label>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 mb-2">Upload Images</label>
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="mb-4"
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-blue-500">Uploading images...</p>}

          <div className="flex flex-wrap gap-4 mt-2">
            {formData.images.map(img => (
              <div key={img} className="relative">
                <img src={`${API_BASE_URL}${img}`} alt="preview" className="h-24 w-24 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => removeImage(img)}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
