import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ProductCard from '../common/ProductCard';
import { API_ENDPOINTS } from '../../config/api';
import { Loader } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const CATEGORIES_TO_SHOW = ['Clothes', 'Toys', 'Care Products', 'Accessories'];

const CategorySections = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setError(null);
        const res = await axios.get(API_ENDPOINTS.PRODUCTS);
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const productsByCategory = useMemo(() => {
    const map = {};
    for (const category of CATEGORIES_TO_SHOW) map[category] = [];
    for (const p of products) {
      if (map[p.category]) map[p.category].push(p);
    }
    return map;
  }, [products]);

  if (loading) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container-custom flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load products</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom space-y-12">
        {CATEGORIES_TO_SHOW.map((category) => {
          const list = productsByCategory[category] || [];
          if (list.length === 0) return null;
          return (
            <div key={category}>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{category}</h2>
                  <p className="text-gray-600">Top picks in {category.toLowerCase()}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {list.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategorySections;


