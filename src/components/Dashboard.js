import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import worksheetsImg from '../assets/images/Worksheets.png';
import flashnumberImg from '../assets/images/Flashnumber.png';
import reportsImg from '../assets/images/Reports.png';
import LogoutImg from '../assets/images/Logout.png';
import profileImg from '../assets/images/Profile.png';
import notificationImg from '../assets/images/Notifications.png';
import logsImg from '../assets/images/Logs.png';
import UnderConstruction from './common/UnderConstruction';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [dashboardItems, setDashboardItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set dashboard items directly (no API call)
  useEffect(() => {
    setLoading(true);

    // Use hardcoded dashboard items
    const defaultItems = [
      { label: 'Worksheets', img: worksheetsImg, route: '/worksheets' },
      {
        label: 'Flash Number',
        img: flashnumberImg,
        route: '/flash-number-game',
      },
      { label: 'Reports', img: reportsImg, route: '/reports' },
      { label: 'Profile', img: profileImg, route: '/profile' },
      {
        label: 'Notifications',
        img: notificationImg,
        route: '/notifications',
      },
      { label: 'Logs', img: logsImg, route: '/logs' },
    ];

    setDashboardItems(defaultItems);
    setLoading(false);
  }, [user]);

  // Debug: Log when Dashboard renders
  console.log('Dashboard rendered');

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-yellow-50 p-4">
        <div className="text-2xl font-bold text-gray-600">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-yellow-50 p-4">
      <div
        className="relative w-full max-w-4xl mx-auto bg-[#faf9ed] rounded-2xl shadow-xl border border-yellow-300 p-6 md:p-8 lg:p-12 flex flex-col items-center"
        style={{ minHeight: '70vh' }}
      >
        {/* Logout button */}
        <button
          className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col items-center group focus:outline-none hover:scale-105 transition-transform"
          onClick={() => {
            if (typeof logout === 'function') logout();
            navigate('/login');
          }}
        >
          <img
            src={LogoutImg}
            alt="Logout"
            className="w-12 h-12 md:w-16 md:h-16 mb-2 transform scale-x-[-1]"
          />
          <span
            className="text-black text-sm md:text-base text-center font-semibold"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Logout
          </span>
        </button>
        {/* Title */}
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-black text-black mb-8 md:mb-10 mt-2 text-center tracking-wider uppercase"
          style={{
            fontFamily: 'Poppins, sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          DASHBOARD
        </h1>
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full justify-items-center">
          {dashboardItems.map(item => {
            if (item.label === 'Flash Number') {
              console.log('Rendering Flash Number button');
            }
            return (
              <button
                key={item.label}
                className="flex flex-col items-center bg-white rounded-lg shadow-md p-3 md:p-4 lg:p-6 transition transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 border border-yellow-200 w-full max-w-[200px]"
                type="button"
                onClick={
                  item.label === 'Flash Number'
                    ? () => {
                        console.log('Flash Number button clicked');
                        console.log('navigate function:', navigate);
                        navigate('/flash-number-game');
                      }
                    : item.label === 'Reports'
                      ? () => {
                          console.log('Reports button clicked');
                          setShowUnderConstruction(true);
                        }
                      : item.label === 'Worksheets'
                        ? () => {
                            console.log('Worksheets button clicked');
                            setShowUnderConstruction(true);
                          }
                        : item.label === 'Profile'
                          ? () => {
                              console.log('Profile button clicked');
                              setShowUnderConstruction(true);
                            }
                          : item.label === 'Notifications'
                            ? () => {
                                console.log('Notifications button clicked');
                                setShowUnderConstruction(true);
                              }
                            : item.label === 'Logs'
                              ? () => {
                                  console.log('Logs button clicked');
                                  setShowUnderConstruction(true);
                                }
                              : undefined
                }
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain mb-2 md:mb-3"
                />
                <span
                  className="text-sm md:text-base lg:text-lg text-black mt-1 text-center font-medium"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Under Construction Modal */}
      {showUnderConstruction && (
        <UnderConstruction onClose={() => setShowUnderConstruction(false)} />
      )}
    </div>
  );
};

export default Dashboard;
