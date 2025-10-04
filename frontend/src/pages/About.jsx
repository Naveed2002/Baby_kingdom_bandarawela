import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Heart, 
  Shield, 
  Award,
  Users,
  Star
} from 'lucide-react';

const About = () => {
  const features = [
    { icon: Heart, title: 'Quality First', description: 'We carefully select every product to ensure it meets the highest safety and quality standards.' },
    { icon: Shield, title: 'Safety Guaranteed', description: 'All our products are tested and certified for baby safety and comfort.' },
    { icon: Award, title: 'Best Prices', description: 'We offer competitive prices without compromising on quality or safety.' },
    { icon: Users, title: 'Expert Advice', description: 'Our team of baby care experts is always ready to help you make the right choices.' }
  ];

  const stats = [
    { number: '1000+', label: 'Happy Families' },
    { number: '500+', label: 'Quality Products' },
    { number: '25+', label: 'Years of Service' },
    { number: '24/7', label: 'Customer Support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container-custom section-padding relative z-10 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">About Baby Kingdom</h1>
          <p className="text-xl text-gray-100 leading-relaxed max-w-3xl mx-auto">
            Your trusted partner in providing the best for your little ones. 
            Located in the heart of Bandarawela, Sri Lanka, we're committed to 
            bringing you quality baby products that ensure comfort, safety, and joy.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">Our Story</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Baby Kingdom was founded with a simple mission: to provide parents in Bandarawela 
            and surrounding areas with access to high-quality, safe, and affordable baby products.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            What started as a small family business has grown into a trusted destination for 
            baby essentials. We understand that every parent wants the best for their child, 
            and we're here to help make that possible.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our team consists of parents, grandparents, and baby care experts who truly 
            understand the needs and concerns of modern families. We're not just selling 
            products; we're building relationships and supporting families in their journey.
          </p>
        </div>
      </section>


      {/* Stats */}
      <section className="section-padding bg-primary text-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section with Map */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Visit Our Store</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Located in the beautiful city of Bandarawela, Sri Lanka</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">
                    Main Street, Bandarawela<br />
                    Uva Province, Sri Lanka<br />
                    Postal Code: 90000
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone Numbers</h3>
                  <p className="text-gray-600">
                    <a href="tel:+94724783380" className="hover:text-primary transition-colors duration-300">+94 72 478 3380</a><br />
                    <a href="tel:+94572220009" className="hover:text-primary transition-colors duration-300">+94 57 222 0009</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:babykingdom.gods@gmail.com" className="hover:text-primary transition-colors duration-300">babykingdom.gods@gmail.com</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 7:00 PM<br />
                    Saturday: 9:00 AM - 6:00 PM<br />
                    Sunday: 10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map */}
<div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.59388542978937!2d80.99182217189046!3d6.830230914939035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae46ffc127ddf3f%3A0x6eae6197c56b4f46!2sBaby%20kingdom%20bandarawela!5e0!3m2!1sen!2slk!4v1756877782355!5m2!1sen!2slk"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
