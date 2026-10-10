import React from 'react';
import { Link } from 'react-router-dom';
import { Thermometer, Shield, Activity, AlertTriangle, Users, BarChart3, Zap } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-charcoal-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-charcoal-900 rounded-lg flex items-center justify-center">
              <Shield className="text-amber-500" size={24} />
            </div>
            <span className="text-2xl font-bold text-charcoal-900">ATHENA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-charcoal-600 hover:text-charcoal-900 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-charcoal-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-charcoal-800 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-700 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6">
              <Zap className="text-amber-500" size={16} />
              <span className="text-amber-500 text-sm font-medium">Heat-Risk Decision Support</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              ATHENA
            </h1>
            <p className="text-2xl text-charcoal-200 mb-4">
              Heat-Risk Awareness for Outdoor Student-Athletes
            </p>
            <p className="text-lg text-charcoal-400 mb-8 max-w-2xl">
              Help colleges and coaches make safer outdoor training decisions using objective weather and heat-risk information.
            </p>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-amber-500 text-charcoal-900 px-8 py-4 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border-2 border-charcoal-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-charcoal-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">The Challenge</h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Heat-related illnesses pose serious risks to student-athletes during outdoor training.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50 border border-red-100 p-8 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-charcoal-900 mb-2">Heat-Related Illness</h3>
              <p className="text-charcoal-600">
                Student-athletes face increased risk of heat exhaustion and heat stroke during outdoor training in hot conditions.
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-100 p-8 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Thermometer className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-charcoal-900 mb-2">Lack of Awareness</h3>
              <p className="text-charcoal-600">
                Training decisions often lack consideration of current weather conditions and their impact on athlete safety.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-8 rounded-xl">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="text-amber-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-charcoal-900 mb-2">No Standard Protocol</h3>
              <p className="text-charcoal-600">
                Many institutions lack systematic approaches to assess and manage heat risk during training sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why ATHENA Section */}
      <section className="py-20 px-6 bg-charcoal-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">Why ATHENA?</h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              A comprehensive system designed to protect student-athletes through informed decision-making.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-charcoal-200 hover:border-amber-500 transition-colors">
              <Shield className="text-charcoal-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Evidence-Based</h3>
              <p className="text-charcoal-600 text-sm">
                Risk assessments based on temperature, humidity, and training factors.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-charcoal-200 hover:border-amber-500 transition-colors">
              <Activity className="text-charcoal-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Real-Time Weather</h3>
              <p className="text-charcoal-600 text-sm">
                Current weather data for up-to-date risk assessments.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-charcoal-200 hover:border-amber-500 transition-colors">
              <AlertTriangle className="text-charcoal-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Incident Tracking</h3>
              <p className="text-charcoal-600 text-sm">
                Record incidents to improve future safety protocols.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-charcoal-200 hover:border-amber-500 transition-colors">
              <BarChart3 className="text-charcoal-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Analytics</h3>
              <p className="text-charcoal-600 text-sm">
                Visual insights into risk patterns and trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Athletes Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-4">
                <Users className="text-green-600" size={16} />
                <span className="text-green-700 text-sm font-medium">For Athletes</span>
              </div>
              <h2 className="text-3xl font-bold text-charcoal-900 mb-4">Know Your Risk</h2>
              <p className="text-charcoal-600 mb-6">
                ATHENA helps student-athletes understand current training conditions and report symptoms quickly.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-charcoal-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  View current weather and risk levels
                </li>
                <li className="flex items-center gap-3 text-charcoal-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Report symptoms easily
                </li>
                <li className="flex items-center gap-3 text-charcoal-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Access training schedules
                </li>
              </ul>
            </div>
            <div className="bg-charcoal-50 p-8 rounded-xl">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-charcoal-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-charcoal-600">Current Risk</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">MODERATE</span>
                  </div>
                  <p className="text-charcoal-900 font-semibold">Training can proceed with modifications</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-charcoal-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Thermometer className="text-orange-500" size={18} />
                    <span className="text-sm text-charcoal-600">Temperature: 32°C</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="text-blue-500" size={18} />
                    <span className="text-sm text-charcoal-600">Humidity: 65%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Coaches Section */}
      <section className="py-20 px-6 bg-charcoal-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-charcoal-800 p-8 rounded-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-charcoal-700 rounded-lg">
                    <div>
                      <p className="text-charcoal-400 text-sm">Today's Sessions</p>
                      <p className="text-white text-2xl font-bold">6</p>
                    </div>
                    <Activity className="text-amber-500" size={32} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-charcoal-700 rounded-lg">
                    <div>
                      <p className="text-charcoal-400 text-sm">Symptom Reports</p>
                      <p className="text-white text-2xl font-bold">2</p>
                    </div>
                    <AlertTriangle className="text-orange-500" size={32} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-charcoal-700 rounded-lg">
                    <div>
                      <p className="text-charcoal-400 text-sm">Current Risk</p>
                      <p className="text-white text-2xl font-bold">MODERATE</p>
                    </div>
                    <Shield className="text-amber-500" size={32} />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-4">
                <Shield className="text-amber-500" size={16} />
                <span className="text-amber-500 text-sm font-medium">For Coaches</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Make Informed Decisions</h2>
              <p className="text-charcoal-300 mb-6">
                ATHENA provides coaches with comprehensive tools to assess risk, monitor athlete health, and plan safer training sessions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-charcoal-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  Assess training risk before sessions
                </li>
                <li className="flex items-center gap-3 text-charcoal-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  Monitor athlete symptom reports
                </li>
                <li className="flex items-center gap-3 text-charcoal-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  Track incidents and improve protocols
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">How It Works</h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              A simple workflow to ensure safer training decisions.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-charcoal-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Check Weather</h3>
              <p className="text-charcoal-600 text-sm">
                View current temperature, humidity, and conditions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-charcoal-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Assess Risk</h3>
              <p className="text-charcoal-600 text-sm">
                Input training details for risk evaluation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-charcoal-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Make Decision</h3>
              <p className="text-charcoal-600 text-sm">
                Receive GO, MODIFY, or NO-GO recommendations
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-charcoal-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Report & Track</h3>
              <p className="text-charcoal-600 text-sm">
                Log symptoms and incidents for continuous improvement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-charcoal-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-charcoal-900 mb-4">Ready to Make Safer Training Decisions?</h2>
          <p className="text-charcoal-600 mb-8">
            Join ATHENA to protect your student-athletes with data-driven safety decisions.
          </p>
          <Link
            to="/register"
            className="bg-charcoal-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors inline-block"
          >
            Register
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-charcoal-900 border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Shield className="text-charcoal-900" size={18} />
              </div>
              <span className="text-xl font-bold text-white">ATHENA</span>
            </div>
            <p className="text-charcoal-400 text-sm">
              Heat-Risk Awareness for Outdoor Student-Athletes
            </p>
            <p className="text-charcoal-500 text-sm">
              &copy; 2026 ATHENA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
