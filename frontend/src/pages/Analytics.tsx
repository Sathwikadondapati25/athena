import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/overview');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'ADMIN') {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [user]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Analytics</h1>
        <p className="text-charcoal-600 mb-8">View analytics and insights</p>

        <div className="bg-white p-8 rounded-xl border border-charcoal-200 text-center">
          <p className="text-charcoal-600">Analytics are only available to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Analytics Dashboard</h1>
      <p className="text-charcoal-600 mb-8">Overview of ATHENA system data</p>

      {data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-charcoal-200">
              <h3 className="text-charcoal-500 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-charcoal-900 mt-2">{data.totalUsers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-charcoal-200">
              <h3 className="text-charcoal-500 text-sm font-medium">Training Sessions</h3>
              <p className="text-3xl font-bold text-charcoal-900 mt-2">{data.totalSessions || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-charcoal-200">
              <h3 className="text-charcoal-500 text-sm font-medium">Risk Assessments</h3>
              <p className="text-3xl font-bold text-charcoal-900 mt-2">{data.totalAssessments || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-charcoal-200">
              <h3 className="text-charcoal-500 text-sm font-medium">Reported Incidents</h3>
              <p className="text-3xl font-bold text-charcoal-900 mt-2">{data.totalIncidents || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-charcoal-200">
              <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Risk Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.riskDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry._id}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(data.riskDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl border border-charcoal-200">
              <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Incidents by Sport</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.incidentsBySport || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-charcoal-200">
              <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Incidents by Month</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.incidentsByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl border border-charcoal-200">
              <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Common Symptoms</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.commonSymptoms || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="_id" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This data is for demonstration purposes. In a production environment, this would show real incident and risk assessment data.
            </p>
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-charcoal-200 text-center">
          <p className="text-charcoal-600">No analytics data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
