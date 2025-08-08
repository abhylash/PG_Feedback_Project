import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, ChefHat, Star, MessageCircle, Edit3, Save, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, Timestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

interface Rating {
  id: string;
  userName: string;
  mealType: string;
  rating: number;
  comment: string;
  date: string;
  timestamp: Timestamp;
}

interface Suggestion {
  id: string;
  userName: string;
  dishName: string;
  category: string;
  description: string;
  date: string;
  timestamp: Timestamp;
  status: string;
}

interface TodaysMenu {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  date: string;
}

const AdminDashboard: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [todaysMenu, setTodaysMenu] = useState<TodaysMenu>({
    breakfast: ['Poha', 'Tea/Coffee', 'Boiled Eggs'],
    lunch: ['Dal Rice', 'Mixed Vegetables', 'Chapati', 'Salad'],
    dinner: ['Rajma', 'Jeera Rice', 'Chapati', 'Raita'],
    date: new Date().toDateString()
  });
  const [editingMenu, setEditingMenu] = useState(false);
  const [tempMenu, setTempMenu] = useState<TodaysMenu>(todaysMenu);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Fetch today's menu
    const fetchTodaysMenu = async () => {
      const today = new Date().toDateString();
      const menuDoc = await getDoc(doc(db, 'todaysMenu', today));
      
      if (menuDoc.exists()) {
        const menuData = menuDoc.data() as TodaysMenu;
        setTodaysMenu(menuData);
        setTempMenu(menuData);
      } else {
        // Set default menu for today
        const defaultMenu = {
          breakfast: ['Poha', 'Tea/Coffee', 'Boiled Eggs'],
          lunch: ['Dal Rice', 'Mixed Vegetables', 'Chapati', 'Salad'],
          dinner: ['Rajma', 'Jeera Rice', 'Chapati', 'Raita'],
          date: today
        };
        await setDoc(doc(db, 'todaysMenu', today), defaultMenu);
        setTodaysMenu(defaultMenu);
        setTempMenu(defaultMenu);
      }
    };

    fetchTodaysMenu();

    // Fetch all ratings
    const ratingsQuery = query(
      collection(db, 'ratings'),
      orderBy('timestamp', 'desc')
    );

    const ratingsUnsubscribe = onSnapshot(ratingsQuery, (snapshot) => {
      const ratingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Rating[];
      setRatings(ratingsData);
    });

    // Fetch all suggestions
    const suggestionsQuery = query(
      collection(db, 'suggestions'),
      orderBy('timestamp', 'desc')
    );

    const suggestionsUnsubscribe = onSnapshot(suggestionsQuery, (snapshot) => {
      const suggestionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Suggestion[];
      setSuggestions(suggestionsData);
      setLoading(false);
    });

    return () => {
      ratingsUnsubscribe();
      suggestionsUnsubscribe();
    };
  }, []);

  const handleMenuItemChange = (mealType: keyof TodaysMenu, index: number, value: string) => {
    if (mealType === 'date') return;
    
    setTempMenu(prev => ({
      ...prev,
      [mealType]: prev[mealType].map((item, i) => i === index ? value : item)
    }));
  };

  const addMenuItem = (mealType: keyof TodaysMenu) => {
    if (mealType === 'date') return;
    
    setTempMenu(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], '']
    }));
  };

  const removeMenuItem = (mealType: keyof TodaysMenu, index: number) => {
    if (mealType === 'date') return;
    
    setTempMenu(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };

  const saveMenu = async () => {
    try {
      const today = new Date().toDateString();
      const menuToSave = { ...tempMenu, date: today };
      
      await setDoc(doc(db, 'todaysMenu', today), menuToSave);
      setTodaysMenu(menuToSave);
      setEditingMenu(false);
      toast.success('Menu updated successfully!');
    } catch (error) {
      toast.error('Failed to update menu');
    }
  };

  const cancelEdit = () => {
    setTempMenu(todaysMenu);
    setEditingMenu(false);
  };

  // Calculate statistics
  const totalRatings = ratings.length;
  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length).toFixed(1)
    : '0';

  const mealTypeStats = ratings.reduce((acc, rating) => {
    acc[rating.mealType] = (acc[rating.mealType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryStats = suggestions.reduce((acc, suggestion) => {
    acc[suggestion.category] = (acc[suggestion.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentRatings = ratings.slice(0, 5);
  const recentSuggestions = suggestions.slice(0, 5);
  const lowRatings = ratings.filter(r => r.rating <= 2).slice(0, 5);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor feedback and manage your PG's dining experience</p>
          </div>
        </div>
      </div>

      {/* Today's Menu Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-blue-500" />
            Today's Menu Management
          </h2>
          {!editingMenu ? (
            <button
              onClick={() => setEditingMenu(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Menu
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveMenu}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
            <div key={meal} className="p-6 rounded-xl border-2 border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize flex items-center gap-2">
                {meal}
              </h3>
              
              {editingMenu ? (
                <div className="space-y-3">
                  {tempMenu[meal].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleMenuItemChange(meal, index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter menu item"
                      />
                      <button
                        onClick={() => removeMenuItem(meal, index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addMenuItem(meal)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
                  >
                    + Add Item
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {todaysMenu[meal].map((item, index) => (
                    <li key={index} className="text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Ratings</p>
              <p className="text-3xl font-bold text-gray-800">{totalRatings}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Star className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Average Rating</p>
              <p className="text-3xl font-bold text-gray-800">{averageRating}/5</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Suggestions</p>
              <p className="text-3xl font-bold text-gray-800">{suggestions.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChefHat className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Low Ratings</p>
              <p className="text-3xl font-bold text-red-600">{lowRatings.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Ratings by Meal Type</h3>
          <div className="space-y-4">
            {Object.entries(mealTypeStats).map(([mealType, count]) => (
              <div key={mealType} className="flex items-center justify-between">
                <span className="capitalize text-gray-700 font-medium">{mealType}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / totalRatings) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600 text-sm w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestion Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Suggestions by Category</h3>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="capitalize text-gray-700 font-medium">
                  {category === 'non-veg' ? 'Non-Veg' : category}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(count / suggestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600 text-sm w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ratings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Ratings</h3>
          <div className="space-y-4">
            {recentRatings.map((rating) => (
              <div key={rating.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{rating.userName}</span>
                    <span className="text-gray-500">•</span>
                    <span className="capitalize text-gray-600">{rating.mealType}</span>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-600 text-sm">{rating.comment}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">{rating.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Suggestions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Suggestions</h3>
          <div className="space-y-4">
            {recentSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-800">{suggestion.dishName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    suggestion.category === 'veg' ? 'bg-green-100 text-green-700' :
                    suggestion.category === 'non-veg' ? 'bg-red-100 text-red-700' :
                    suggestion.category === 'jain' ? 'bg-orange-100 text-orange-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {suggestion.category === 'non-veg' ? 'Non-Veg' : suggestion.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-600 text-sm">by {suggestion.userName}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400 text-xs">{suggestion.date}</span>
                </div>
                {suggestion.description && (
                  <p className="text-gray-600 text-sm">{suggestion.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Ratings Alert */}
      {lowRatings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Recent Low Ratings (⭐⭐ or below)
          </h3>
          <div className="space-y-3">
            {lowRatings.map((rating) => (
              <div key={rating.id} className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rating.rating
                            ? 'text-red-400 fill-red-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-800">{rating.userName}</span>
                  <span className="capitalize text-gray-600">{rating.mealType}</span>
                  <span className="text-gray-400 text-sm">{rating.date}</span>
                </div>
                {rating.comment && (
                  <p className="text-gray-700">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;