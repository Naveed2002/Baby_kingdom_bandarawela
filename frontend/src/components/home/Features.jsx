import { Truck, Shield, Award, Users } from 'lucide-react';

const Features = () => {
  const features = [
    { icon: Truck, title: 'Free Shipping', description: 'Free shipping on orders over Rs. 5000' },
    { icon: Shield, title: 'Quality Guarantee', description: '100% quality assurance on all products' },
    { icon: Award, title: 'Best Prices', description: 'Competitive prices for premium products' },
    { icon: Users, title: 'Expert Support', description: '24/7 customer support available' }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Baby Kingdom?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to providing the best products and service for your little ones
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;


