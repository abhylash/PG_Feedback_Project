import React from 'react';
import { Link } from 'react-router-dom';
import { Star, PlusCircle, History, Clock, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  const todaysMenu = {
    breakfast: ['Poha', 'Tea/Coffee', 'Boiled Eggs'],
    lunch: ['Dal Rice', 'Mixed Vegetables', 'Chapati', 'Salad'],
    dinner: ['Rajma', 'Jeera Rice', 'Chapati', 'Raita']
  };

  const currentHour = new Date().getHours();
  const currentMeal = currentHour < 10 ? 'breakfast' : currentHour < 16 ? 'lunch' : 'dinner';

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <ChefHat className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to PG Feedback App
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Share your feedback on meals, suggest new dishes, and help us improve your dining experience
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Greeting */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Hi, {currentUser.displayName || 'User'}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              How was your meal today? Share your feedback to help us improve.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 text-blue-500">
            <Clock className="w-5 h-5" />
            <span className="font-medium capitalize">{currentMeal} Time</span>
          </div>
        </div>
      </div>

      {/* Today's Menu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-blue-500" />
          Today's Menu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(todaysMenu).map(([meal, items]) => (
            <div 
              key={meal} 
              className={`p-6 rounded-xl border-2 transition-all ${
                meal === currentMeal 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize flex items-center gap-2">
                {meal === currentMeal && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                {meal}
              </h3>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={index} className="text-gray-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/rate-meal"
          className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all hover:border-blue-200"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6 group-hover:bg-blue-200 transition-colors">
            <Star className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Rate Today's Meal</h3>
          <p className="text-gray-600">Share your experience and help us improve our menu</p>
        </Link>

        <Link
          to="/suggest-menu"
          className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all hover:border-green-200"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6 group-hover:bg-green-200 transition-colors">
            <PlusCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Suggest a Dish</h3>
          <p className="text-gray-600">Have a favorite dish? Let us know what you'd like to see</p>
        </Link>

        <Link
          to="/feedback-history"
          className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all hover:border-purple-200"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mb-6 group-hover:bg-purple-200 transition-colors">
            <History className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Feedback History</h3>
          <p className="text-gray-600">View your past ratings and suggestions</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;