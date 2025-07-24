import React, { useState } from 'react';
import { Star, MessageCircle, Clock, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const RateMeal: React.FC = () => {
  const { currentUser } = useAuth();
  const [mealType, setMealType] = useState('lunch');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || rating === 0) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'ratings'), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        mealType,
        rating,
        comment,
        date: new Date().toDateString(),
        timestamp: new Date()
      });

      toast.success('Thank you for your feedback!');
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4 mx-auto">
            <Star className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Rate Today's Meal</h1>
          <p className="text-gray-600">Your feedback helps us improve our menu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Meal Type Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Which meal would you like to rate?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['breakfast', 'lunch', 'dinner'].map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setMealType(meal)}
                  className={`p-4 rounded-lg border-2 transition-all capitalize font-medium ${
                    mealType === meal
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    {meal}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating Stars */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              How would you rate this meal?
            </label>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-center">
                <span className="text-lg font-medium text-gray-700">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Additional Comments (Optional)
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Tell us more about your experience..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={rating === 0 || loading}
            className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Check className="w-5 h-5" />
                Submit Rating
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RateMeal;