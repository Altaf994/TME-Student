import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../utils/api';
import flashNumberIcon from '../assets/images/Flashnumber.png';
import logoutIcon from '../assets/images/Logout.png';
import universityIcon from '../assets/images/university.png';
// chemistryIcon removed (not used)

export default function FlashNumberGame() {
  const navigate = useNavigate();

  const slugify = str =>
    String(str)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  const goToGame = group => {
    // log to help debug navigation issues
    // eslint-disable-next-line no-console
    console.log('goToGame ->', group.title);

    const firstId =
      group && group.questions && group.questions[0] && group.questions[0].id;
    if (firstId) {
      // Normalize API question keys (uppercase A..T) to lowercase a..t expected by activity
      const normalize = q => {
        if (!q) return q;
        const out = { ...q };
        const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        for (let i = 0; i < 20; i++) {
          const upper = letters[i].toUpperCase();
          const lower = letters[i];
          if (Object.prototype.hasOwnProperty.call(q, upper)) {
            out[lower] = q[upper];
          }
        }
        return out;
      };

      const normalized = group.questions.map(normalize);

      navigate(`/activity/${firstId}`, {
        state: { assignedQuestions: normalized },
      });
    } else {
      const slug = slugify(group.title);
      navigate(`/game/${slug}`);
    }
  };
  // Static presentational activity cards (no hard-coded data array)
  const [assignments, setAssignments] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchAssignments = async () => {
      try {
        const config = { headers: { 'Content-Type': 'application/json' } };
        const response = await apiService.get(
          '/v1/assignments/grouped',
          config
        );
        if (mounted) setAssignments(response.data);
      } catch (err) {
        if (mounted) setAssignments(null);
        // swallow errors for now; caller will instruct next steps
      }
    };

    fetchAssignments();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (assignments) {
      // use assignments so it's not flagged as unused; keep for debugging
      // caller can decide how to display it later
      // eslint-disable-next-line no-console
      console.log('assignments', assignments);
    }
  }, [assignments]);

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
          <div className="flex flex-col items-center order-3 p-1 sm:p-2 rounded-lg">
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
        {/* Bottom Left Dashboard */}
        <div className="absolute left-1 xs:left-2 sm:left-3 md:left-4 lg:left-6 xl:left-8 bottom-1 xs:bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 xl:bottom-8 flex flex-col items-center z-10 p-1 sm:p-2 rounded-lg">
          <img
            src={universityIcon}
            alt="University"
            className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 drop-shadow-sm"
          />
          <span className="text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg font-medium mt-1 text-center text-gray-700">
            DASHBOARD
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 w-full">
          {assignments &&
          Array.isArray(assignments) &&
          assignments.length > 0 ? (
            assignments.map(group => {
              return (
                <div
                  key={group.title}
                  role="button"
                  tabIndex={0}
                  onClick={() => goToGame(group)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      goToGame(group);
                    }
                  }}
                  className="relative z-20 flex flex-col items-center p-3 rounded-lg bg-white/40 shadow-md border border-white/50 h-[120px] cursor-pointer"
                >
                  <img
                    src={universityIcon}
                    alt="Game"
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                  />
                  {/* numbers removed: hiding question count, choices, and answer */}
                  <span className="mt-2 text-xs sm:text-sm font-serif text-center px-1 break-words leading-tight font-medium">
                    {group.title}
                  </span>
                  {/* counts intentionally hidden */}
                </div>
              );
            })
          ) : (
            // fallback placeholders
            <>
              <div className="relative z-20 flex flex-col items-center p-3 rounded-lg bg-white/40 shadow-md border border-white/50 h-[120px]">
                <img
                  src={universityIcon}
                  alt="Activity"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                />
                <span className="mt-2 text-xs sm:text-sm font-serif text-center px-1 break-words leading-tight font-medium">
                  Activity 1
                </span>
              </div>
              <div className="relative z-20 flex flex-col items-center p-3 rounded-lg bg-white/40 shadow-md border border-white/50 h-[120px]">
                <img
                  src={universityIcon}
                  alt="Activity"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                />
                <span className="mt-2 text-xs sm:text-sm font-serif text-center px-1 break-words leading-tight font-medium">
                  Activity 2
                </span>
              </div>
              <div className="relative z-20 flex flex-col items-center p-3 rounded-lg bg-white/40 shadow-md border border-white/50 h-[120px]">
                <img
                  src={universityIcon}
                  alt="Activity"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                />
                <span className="mt-2 text-xs sm:text-sm font-serif text-center px-1 break-words leading-tight font-medium">
                  Activity 3
                </span>
              </div>
              <div className="relative z-20 flex flex-col items-center p-3 rounded-lg bg-white/40 shadow-md border border-white/50 h-[120px]">
                <img
                  src={universityIcon}
                  alt="Activity"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                />
                <span className="mt-2 text-xs sm:text-sm font-serif text-center px-1 break-words leading-tight font-medium">
                  Activity 4
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
