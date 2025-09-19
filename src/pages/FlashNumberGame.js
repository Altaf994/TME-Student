import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../utils/api';
import flashNumberIcon from '../assets/images/Flashnumber.png';
import logoutIcon from '../assets/images/Logout.png';
import universityIcon from '../assets/images/university.png';
import chemistryIcon from '../assets/images/chemistry.png';

export default function FlashNumberGame() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);

        // Get student ID from user data or use a default
        // const studentId = user?.student_id || user?.id || 'STU001';

        const response = await apiService.get('/assign-questions/');
        const data = response.data || {};
        const questions = data.assigned_questions || [];

        // Extract unique activity names from questions
        const activityNames = [...new Set(questions.map(q => q.activity_name))];

        // Create activities array from unique activity names with speed info
        const activities = activityNames.map((name, index) => {
          const activityQuestions = questions.filter(
            q => q.activity_name === name
          );
          const firstQuestion = activityQuestions[0];
          const speed = firstQuestion?.speed || firstQuestion?.duration || 1.2; // Default to 1.2 if not found

          return {
            id: index + 1,
            title: name,
            questions: activityQuestions,
            speed: speed,
            speedDisplay: speed.toString(),
          };
        });

        setActivities(activities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        // Fallback to default activities if API fails
        setActivities([
          {
            id: 1,
            title: 'test decimal speed again',
            questions: [],
            speed: 1.2,
            speedDisplay: '1.2',
          },
          {
            id: 2,
            title: 'test decimal after fix',
            questions: [],
            speed: 0.8,
            speedDisplay: '0.8',
          },
          {
            id: 3,
            title: 'Addition Practice',
            questions: [],
            speed: 1.5,
            speedDisplay: '1.5',
          },
          {
            id: 4,
            title: 'Subtraction Drill',
            questions: [],
            speed: 1.0,
            speedDisplay: '1.0',
          },
          {
            id: 5,
            title: 'Multiplication Test',
            questions: [],
            speed: 2.0,
            speedDisplay: '2.0',
          },
          {
            id: 6,
            title: 'Division Challenge',
            questions: [],
            speed: 1.8,
            speedDisplay: '1.8',
          },
          {
            id: 7,
            title: 'Mixed Operations',
            questions: [],
            speed: 1.3,
            speedDisplay: '1.3',
          },
          {
            id: 8,
            title: 'Speed Math',
            questions: [],
            speed: 0.5,
            speedDisplay: '0.5',
          },
          {
            id: 9,
            title: 'Number Recognition',
            questions: [],
            speed: 0.7,
            speedDisplay: '0.7',
          },
          {
            id: 10,
            title: 'Mental Math',
            questions: [],
            speed: 1.1,
            speedDisplay: '1.1',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchActivities();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">
          Loading activities...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-2 xs:p-3 sm:p-4">
      <div className="bg-[#faf9ed] rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-[1400px] min-h-[85vh] sm:min-h-[90vh] p-3 xs:p-4 sm:p-6 md:p-8 flex flex-col relative">
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 md:mb-8 lg:mb-10 gap-4 sm:gap-0">
          {/* Left Icon */}
          <div className="flex flex-col items-center order-2 sm:order-1">
            <img
              src={flashNumberIcon}
              alt="Flash Number"
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
            />
          </div>
          {/* Title */}
          <h1
            className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-center tracking-wide order-1 sm:order-2 px-2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            ABACUS FLASH GAME
          </h1>
          {/* Logout */}
          <div
            className="flex flex-col items-center order-3 cursor-pointer hover:scale-105 transition-transform p-1 sm:p-2 rounded-lg hover:bg-gray-100"
            onClick={() => navigate('/login')}
          >
            <img
              src={logoutIcon}
              alt="Logout"
              className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 drop-shadow-sm"
            />
            <span className="text-xs xs:text-sm sm:text-sm md:text-base lg:text-xl mt-1 sm:mt-2 font-medium text-gray-700">
              Logout
            </span>
          </div>
        </div>
        {/* Activities Grid */}
        <div className="flex-1 px-2 sm:px-4 pb-16 sm:pb-20 md:pb-24">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 w-full">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform p-3 rounded-lg hover:bg-white/60 bg-white/40 shadow-md border border-white/50 h-[120px]"
                onClick={() => {
                  navigate(`/activity/${activity.id}`);
                }}
              >
                <img
                  src={chemistryIcon}
                  alt="Activity"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                />
                <span className="mt-2 text-xs sm:text-sm font-serif text-center px-1 break-words leading-tight font-medium">
                  {activity.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom Left Dashboard */}
        <div
          className="absolute left-1 xs:left-2 sm:left-3 md:left-4 lg:left-6 xl:left-8 bottom-1 xs:bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 xl:bottom-8 flex flex-col items-center z-10 cursor-pointer hover:scale-105 transition-transform p-1 sm:p-2 rounded-lg hover:bg-gray-100"
          onClick={() => navigate('/dashboard')}
        >
          <img
            src={universityIcon}
            alt="University"
            className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 drop-shadow-sm"
          />
          <span className="text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg font-medium mt-1 text-center text-gray-700">
            DASHBOARD
          </span>
        </div>
      </div>
    </div>
  );
}
