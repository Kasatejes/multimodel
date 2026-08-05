import React from 'react';
import { StudyPlanDay } from '../types';
import { Calendar, CheckCircle, BookOpen, Dumbbell, Clock } from 'lucide-react';

interface StudyPlanCardProps {
  day: StudyPlanDay;
}

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({ day }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-blue-600/15 text-blue-400 font-bold text-xs rounded-lg border border-blue-500/20">
            Day {day.day}
          </span>
          <span className="flex items-center space-x-1 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{day.duration_minutes} mins</span>
          </span>
        </div>

        <h4 className="text-base font-bold text-slate-100 tracking-tight mb-2">
          {day.topic}
        </h4>

        <p className="text-xs text-slate-300 font-medium bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 mb-4">
          🎯 Objective: {day.objective}
        </p>

        <div className="space-y-3">
          <div className="flex items-start space-x-2.5">
            <div className="p-1 bg-blue-500/10 text-blue-400 rounded-md mt-0.5">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">Learning Task</span>
              <p className="text-xs text-slate-300 leading-relaxed">{day.learning_activity}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <div className="p-1 bg-amber-500/10 text-amber-400 rounded-md mt-0.5">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">Practice Exercise</span>
              <p className="text-xs text-slate-300 leading-relaxed">{day.practice_activity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
