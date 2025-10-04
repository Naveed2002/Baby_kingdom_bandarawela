import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import ProductCard from '../components/common/ProductCard';
import { Loader, Filter, Grid, List, SlidersHorizontal, X, ChevronDown, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const response = await axios.get(API_ENDPOINTS.PRODUCTS);
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const categoryFilter = query.get('category');
  const searchFilter = (query.get('search') || '').toLowerCase();

  // Extract unique values for filters
  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const ageGroups = useMemo(() => [...new Set(products.map(p => p.ageGroup).filter(Boolean))], [products]);
  const brands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))], [products]);
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products]);

  // Apply all filters
  const filtered = useMemo(() => {
    let list = products;

    // URL-based filters
    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter);
    }
    if (searchFilter) {
      list = list.filter(p =>
        p.name?.toLowerCase().includes(searchFilter) ||
        p.description?.toLowerCase().includes(searchFilter) ||
        p.category?.toLowerCase().includes(searchFilter) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchFilter))
      );
    }

    // Advanced filters
    if (selectedCategories.length > 0) {
      list = list.filter(p => selectedCategories.includes(p.category));
    }
    if (selectedAgeGroups.length > 0) {
      list = list.filter(p => selectedAgeGroups.includes(p.ageGroup));
    }
    if (selectedBrands.length > 0) {
      list = list.filter(p => selectedBrands.includes(p.brand));
    }
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
      list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }
    if (minRating > 0) {
      list = list.filter(p => 4.8 >= minRating); // Using default rating for now
    }

    return list;
  }, [products, categoryFilter, searchFilter, selectedCategories, selectedAgeGroups, selectedBrands, priceRange, minRating, maxPrice]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating':
        return sorted.sort((a, b) => 4.8 - 4.8); // Placeholder for actual rating
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  }, [filtered, sortBy]);

  // Filter functions
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleAgeGroup = (ageGroup) => {
    setSelectedAgeGroups(prev => 
      prev.includes(ageGroup) 
        ? prev.filter(a => a !== ageGroup)
        : [...prev, ageGroup]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedAgeGroups([]);
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setSortBy('newest');
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
                          selectedAgeGroups.length > 0 || 
                          selectedBrands.length > 0 || 
                          priceRange[0] > 0 || 
                          priceRange[1] < maxPrice || 
                          minRating > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop Baby Products</h1>
          <p className="text-xl text-gray-600">Discover our collection of quality baby essentials</p>
          {searchFilter && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <p className="text-lg font-medium text-primary">
                Search results for "{searchFilter}" - {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          )}
        </div>

        {/* Filters and Controls Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left side - Filter toggle and results count */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-white text-primary text-xs px-2 py-1 rounded-full">
                    {selectedCategories.length + selectedAgeGroups.length + selectedBrands.length}
                  </span>
                )}
              </button>
              
              <span className="text-gray-600">
                {sortedProducts.length} of {products.length} products
              </span>
            </div>

            {/* Right side - View toggle and sorting */}
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedCategories.map(category => (
                  <span key={category} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {category}
                    <button onClick={() => toggleCategory(category)} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedAgeGroups.map(ageGroup => (
                  <span key={ageGroup} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {ageGroup}
                    <button onClick={() => toggleAgeGroup(ageGroup)} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedBrands.map(brand => (
                  <span key={brand} className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {brand}
                    <button onClick={() => toggleBrand(brand)} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Groups */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Age Groups</h3>
                <div className="space-y-2">
                  {ageGroups.map(ageGroup => (
                    <label key={ageGroup} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAgeGroups.includes(ageGroup)}
                        onChange={() => toggleAgeGroup(ageGroup)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{ageGroup}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Brands</h3>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range & Rating */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price & Rating</h3>
                
                {/* Price Range */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">Price Range: Rs. {priceRange[0].toLocaleString()} - Rs. {priceRange[1].toLocaleString()}</label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Minimum Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                        className={`p-1 rounded ${
                          minRating >= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                    {minRating > 0 && (
                      <span className="text-sm text-gray-600 ml-2">{minRating}+ stars</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{error}</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found matching your filters.</p>
            <button
              onClick={clearAllFilters}
              className="mt-2 text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onAddToCart={addToCart}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
