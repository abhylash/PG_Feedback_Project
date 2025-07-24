import React, { useState } from 'react';
import { PlusCircle, Send, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const SuggestMenu: React.FC = () => {
  const { currentUser } = useAuth();
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState('veg');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'veg', label: 'Vegetarian', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'non-veg', label: 'Non-Vegetarian', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'jain', label: 'Jain', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { value: 'others', label: 'Others', color: 'bg-purple-100 text-purple-700 border-purple-200' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !dishName.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'suggestions'), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        dishName: dishName.trim(),
        category,
        description: description.trim(),
        date: new Date().toDateString(),
        timestamp: new Date(),
        status: 'pending'
      });

      toast.success('Thank you for your suggestion!');
      // Reset form
      setDishName('');
      setDescription('');
      setCategory('veg');
    } catch (error) {
      toast.error('Failed to submit suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-4 mx-auto">
            <PlusCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Suggest a New Dish</h1>
          <p className="text-gray-600">Help us expand our menu with your favorite dishes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dish Name */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              What dish would you like to suggest?
            </label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-lg"
              placeholder="e.g., Butter Chicken, Pasta, Biryani..."
              required
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-lg border-2 transition-all font-medium ${
                    category === cat.value
                      ? cat.color
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">{cat.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
              placeholder="Tell us more about this dish, why you'd like to see it on our menu..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!dishName.trim() || loading}
            className="w-full py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Suggestion
              </>
            )}
          </button>
        </form>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-center">
            💡 Your suggestions help us create a menu that everyone loves!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuggestMenu;