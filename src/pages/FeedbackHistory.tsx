import React, { useState, useEffect } from 'react';
import { History, Star, MessageCircle, Calendar, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

interface Rating {
  id: string;
  mealType: string;
  rating: number;
  comment: string;
  date: string;
  timestamp: any;
}

interface Suggestion {
  id: string;
  dishName: string;
  category: string;
  description: string;
  date: string;
  timestamp: any;
  status: 'pending' | 'approved' | 'rejected';
}

const FeedbackHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'ratings' | 'suggestions'>('ratings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch ratings
    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const ratingsUnsubscribe = onSnapshot(ratingsQuery, (snapshot) => {
      const ratingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Rating[];
      setRatings(ratingsData);
    });

    // Fetch suggestions
    const suggestionsQuery = query(
      collection(db, 'suggestions'),
      where('userId', '==', currentUser.uid),
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
  }, [currentUser]);

  const handleDeleteSuggestion = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'suggestions', id));
      toast.success('Suggestion deleted successfully');
    } catch (error) {
      toast.error('Failed to delete suggestion');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your feedback history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
            <History className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Feedback History</h1>
            <p className="text-gray-600">View and manage your past ratings and suggestions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('ratings')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'ratings'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Ratings ({ratings.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Suggestions ({suggestions.length})
            </div>
          </button>
        </div>

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-6">
            {ratings.length === 0 ? (
              <div className="text-center py-16">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">No ratings yet</h3>
                <p className="text-gray-400">Start rating meals to see your history here</p>
              </div>
            ) : (
              ratings.map((rating) => (
                <div key={rating.id} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-800 capitalize">
                        {rating.mealType}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= rating.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 mt-2 md:mt-0">
                      <Calendar className="w-4 h-4" />
                      <span>{rating.date}</span>
                    </div>
                  </div>
                  {rating.comment && (
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                      <p className="text-gray-700">{rating.comment}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            {suggestions.length === 0 ? (
              <div className="text-center py-16">
                <PlusCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">No suggestions yet</h3>
                <p className="text-gray-400">Start suggesting dishes to see your history here</p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {suggestion.dishName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${
                          suggestion.category === 'veg' ? 'bg-green-100 text-green-700 border-green-200' :
                          suggestion.category === 'non-veg' ? 'bg-red-100 text-red-700 border-red-200' :
                          suggestion.category === 'jain' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-purple-100 text-purple-700 border-purple-200'
                        }`}>
                          {suggestion.category === 'non-veg' ? 'Non-Veg' : suggestion.category}
                        </span>
                      </div>
                      {suggestion.description && (
                        <p className="text-gray-600 mb-3">{suggestion.description}</p>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{suggestion.date}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusColor(suggestion.status)}`}>
                          {suggestion.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <button
                        onClick={() => handleDeleteSuggestion(suggestion.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete suggestion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackHistory;