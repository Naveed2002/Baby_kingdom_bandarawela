import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Categories from '../components/home/Categories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Cta from '../components/home/Cta';
import CategorySections from '../components/home/CategorySections';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Categories />
      <FeaturedProducts />
      <CategorySections />
      <Cta />
    </div>
  );
};

export default Home;