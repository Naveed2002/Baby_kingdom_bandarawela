import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle
} from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: [
        'Main Street, Bandarawela',
        'Uva Province, Sri Lanka',
        'Postal Code: 90150'
      ]
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: [
        '+94 72 478 3380',
        '+94 77 029 5737'
      ]
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: [
        'babykingdom.goods@gmail.com',
      ]
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        '8:30 AM - 8:30 PM',
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container-custom section-padding relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Contact Baby Kingdom
            </h1>
            <p className="text-xl text-gray-100 leading-relaxed">
              Have questions or need assistance? Reach out to us via phone, email, or visit our store in Bandarawela. We're here to help you and your little ones!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="flex flex-col items-start p-6 bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{info.title}</h3>
                <div className="space-y-1 text-gray-600">
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex}>{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Contact Buttons */}
          <div className="mt-12 text-center space-y-4">
            <a
              href="tel:+94724783380"
              className="inline-flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <Phone className="w-5 h-5" />
              <span>Call Us Now</span>
            </a>

            <a
              href="https://wa.me/+94770295737"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 px-6 py-4 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href="mailto:babykingdom.goods@gmail.com"
              className="inline-flex items-center space-x-3 px-6 py-4 bg-purple-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <Mail className="w-5 h-5" />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
