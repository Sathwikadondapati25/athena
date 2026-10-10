import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface RiskRule {
  _id?: string;
  id: string;
  name: string;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  recommendation: string;
}

const defaultRules: RiskRule[] = [
  {
    id: '1',
    name: 'Low Risk',
    tempMin: 0,
    tempMax: 26,
    humidityMin: 0,
    humidityMax: 100,
    riskLevel: 'LOW',
    recommendation: 'Normal training allowed'
  },
  {
    id: '2',
    name: 'Moderate Risk',
    tempMin: 27,
    tempMax: 32,
    humidityMin: 0,
    humidityMax: 100,
    riskLevel: 'MODERATE',
    recommendation: 'Increase rest breaks, ensure hydration'
  },
  {
    id: '3',
    name: 'High Risk',
    tempMin: 33,
    tempMax: 39,
    humidityMin: 0,
    humidityMax: 100,
    riskLevel: 'HIGH',
    recommendation: 'Modify training intensity, reduce duration'
  },
  {
    id: '4',
    name: 'Extreme Risk',
    tempMin: 40,
    tempMax: 50,
    humidityMin: 0,
    humidityMax: 100,
    riskLevel: 'EXTREME',
    recommendation: 'Cancel outdoor training, move indoors'
  }
];

const AdminRiskRules: React.FC = () => {
  const [rules, setRules] = useState<RiskRule[]>(defaultRules);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RiskRule | null>(null);
  const [formData, setFormData] = useState<Partial<RiskRule>>({
    name: '',
    tempMin: 0,
    tempMax: 0,
    humidityMin: 0,
    humidityMax: 100,
    riskLevel: 'LOW',
    recommendation: ''
  });

  const getRiskBadge = (level: string) => {
    const styles = {
      LOW: 'bg-green-100 text-green-700 border-green-200',
      MODERATE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
      EXTREME: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[level as keyof typeof styles] || styles.LOW;
  };

  const handleAdd = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      tempMin: 0,
      tempMax: 0,
      humidityMin: 0,
      humidityMax: 100,
      riskLevel: 'LOW',
      recommendation: ''
    });
    setShowModal(true);
  };

  const handleEdit = (rule: RiskRule) => {
    setEditingRule(rule);
    setFormData({ ...rule });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.recommendation) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...formData, id: editingRule.id } as RiskRule : r));
    } else {
      const newRule: RiskRule = {
        ...formData,
        id: Date.now().toString()
      } as RiskRule;
      setRules([...rules, newRule]);
    }

    setShowModal(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900">Risk Rules</h2>
          <p className="text-charcoal-600">Configure heat-risk assessment thresholds and recommendations</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-charcoal-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Rule
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-medium text-amber-900">Risk Rule Configuration</p>
          <p className="text-sm text-amber-700 mt-1">
            These rules determine heat-risk levels based on temperature and humidity. 
            Rules are evaluated in order - the first matching rule determines the risk level.
          </p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-charcoal-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-charcoal-50 border-b border-charcoal-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Rule Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Temperature (°C)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Humidity (%)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Recommendation</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Shield className="text-charcoal-400" size={20} />
                      <span className="font-medium text-charcoal-900">{rule.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal-600">
                    {rule.tempMin}°C - {rule.tempMax}°C
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal-600">
                    {rule.humidityMin}% - {rule.humidityMax}%
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBadge(rule.riskLevel)}`}>
                      {rule.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal-600 max-w-xs truncate">
                    {rule.recommendation}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-charcoal-200">
              <h3 className="text-xl font-bold text-charcoal-900">
                {editingRule ? 'Edit Risk Rule' : 'Add Risk Rule'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Low Risk Condition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Min Temperature (°C)</label>
                  <input
                    type="number"
                    value={formData.tempMin}
                    onChange={(e) => setFormData({ ...formData, tempMin: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Max Temperature (°C)</label>
                  <input
                    type="number"
                    value={formData.tempMax}
                    onChange={(e) => setFormData({ ...formData, tempMax: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Min Humidity (%)</label>
                  <input
                    type="number"
                    value={formData.humidityMin}
                    onChange={(e) => setFormData({ ...formData, humidityMin: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Max Humidity (%)</label>
                  <input
                    type="number"
                    value={formData.humidityMax}
                    onChange={(e) => setFormData({ ...formData, humidityMax: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Risk Level</label>
                <select
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="LOW">LOW</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="HIGH">HIGH</option>
                  <option value="EXTREME">EXTREME</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Recommendation</label>
                <textarea
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Normal training allowed"
                />
              </div>
            </div>
            <div className="p-6 border-t border-charcoal-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-charcoal-300 rounded-lg font-medium hover:bg-charcoal-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-charcoal-900 text-white rounded-lg font-semibold hover:bg-charcoal-800 transition-colors"
              >
                {editingRule ? 'Update Rule' : 'Add Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRiskRules;
