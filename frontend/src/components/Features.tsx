import { Video, Calendar, CreditCard, Users, Shield, Zap, Headphones, Award } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Live Video Lessons',
    description: 'Real-time two-way audio/video with screen sharing and recording capabilities.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Calendar-based booking with automated reminders and timezone support.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Stripe integration with manual payment tracking and invoice generation.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Headphones,
    title: 'Practice Room Recording',
    description: 'Record your practice sessions and get AI-powered feedback on timing and pitch.',
    color: 'bg-red-100 text-red-600',
  },
   {
    icon: Users,
    title: 'Music Community',
    description: 'Connect with other musicians, join ensembles, and participate in group classes.',
    color: 'bg-teal-100 text-teal-600',

  },
  {
    icon: Award,
    title: 'Certified Teachers',
    description: 'All teachers are certified professionals with background checks and teaching credentials.',
    color: 'bg-pink-100 text-pink-600',

  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Education
          </h2>
          <p className="text-lg text-gray-600">
            Our development roadmap focuses on delivering the best classroom experience 
            through cutting-edge technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}