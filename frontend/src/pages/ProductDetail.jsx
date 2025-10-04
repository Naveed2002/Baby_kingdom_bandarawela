import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { Loader, ChevronLeft, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductCard from '../components/common/ProductCard';
import { useCart } from '../contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        const [detailRes, relatedRes] = await Promise.all([
          axios.get(`${API_ENDPOINTS.PRODUCTS}/${id}`),
          axios.get(API_ENDPOINTS.RELATED_PRODUCTS(id)),
        ]);
        setProduct(detailRes.data);
        setRelatedProducts(relatedRes.data?.products || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const related = useMemo(() => relatedProducts, [relatedProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product not available</h2>
          <p className="text-gray-600 mb-6">{error || 'We could not find the product you are looking for.'}</p>
          <Link to="/shop" className="btn-primary inline-flex items-center">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <Link to="/shop" className="inline-flex items-center text-primary hover:underline mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow relative">
              <img
                src={`${API_BASE_URL}${product.mainImage}`}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=Image+Not+Found'; }}
              />
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold shadow-lg">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.images.map((img, idx) => (
                  <img key={idx} src={`${API_BASE_URL}${img}`} alt="thumb" className="h-20 w-full object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
              {product.ageGroup && (
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{product.ageGroup}</span>
              )}
              <span className="text-green-600 text-sm inline-flex items-center">
                <Check className="w-4 h-4 mr-1" /> In stock
              </span>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

            <div className="flex gap-3">
              <button
                onClick={() => { addToCart(product, 1); toast.success('Added to cart'); }}
                className="btn-primary inline-flex items-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Related products</h2>
                <p className="text-gray-600">You may also like</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
