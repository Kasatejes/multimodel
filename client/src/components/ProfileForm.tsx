import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFormSchema, ProfileFormInput } from '../lib/schemas';
import { UserProfile } from '../types';
import { User, GraduationCap, Calendar, Target, Award, Clock, Save, Loader2 } from 'lucide-react';

interface ProfileFormProps {
  initialData?: UserProfile | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [knownTechInput, setKnownTechInput] = useState('');
  const [weakTechInput, setWeakTechInput] = useState('');
  const [knownTechs, setKnownTechs] = useState<string[]>(initialData?.known_technologies || ['HTML', 'CSS', 'JavaScript']);
  const [weakTechs, setWeakTechs] = useState<string[]>(initialData?.weak_technologies || ['System Architecture']);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      university: initialData?.university || '',
      current_year: initialData?.current_year || 'Final Year',
      target_role: (initialData?.target_role as any) || 'Frontend Developer',
      experience_level: (initialData?.experience_level as any) || 'Beginner',
      preferred_difficulty: (initialData?.preferred_difficulty as any) || 'Easy',
      daily_preparation_minutes: initialData?.daily_preparation_minutes || 60,
    },
  });

  const handleAddKnown = () => {
    if (knownTechInput.trim() && !knownTechs.includes(knownTechInput.trim())) {
      setKnownTechs([...knownTechs, knownTechInput.trim()]);
      setKnownTechInput('');
    }
  };

  const handleRemoveKnown = (tech: string) => {
    setKnownTechs(knownTechs.filter((t) => t !== tech));
  };

  const handleAddWeak = () => {
    if (weakTechInput.trim() && !weakTechs.includes(weakTechInput.trim())) {
      setWeakTechs([...weakTechs, weakTechInput.trim()]);
      setWeakTechInput('');
    }
  };

  const handleRemoveWeak = (tech: string) => {
    setWeakTechs(weakTechs.filter((t) => t !== tech));
  };

  const handleFormSubmit = (data: ProfileFormInput) => {
    onSubmit({
      ...data,
      known_technologies: knownTechs,
      weak_technologies: weakTechs,
      onboarding_completed: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              {...register('full_name')}
              type="text"
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500"
            />
          </div>
          {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name.message}</p>}
        </div>

        {/* University */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            University / College
          </label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              {...register('university')}
              type="text"
              placeholder="e.g. Stanford University"
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Current Year */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Academic Status / Year
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <select
              {...register('current_year')}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100"
            >
              <option value="1st Year">1st Year Undergraduate</option>
              <option value="2nd Year">2nd Year Undergraduate</option>
              <option value="3rd Year">3rd Year Undergraduate</option>
              <option value="Final Year">Final Year Undergraduate</option>
              <option value="Graduate / Entry-Level">Graduate / Entry-Level Job Seeker</option>
            </select>
          </div>
        </div>

        {/* Target Role */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Primary Target Role
          </label>
          <div className="relative">
            <Target className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <select
              {...register('target_role')}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100"
            >
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
            </select>
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Skill Experience Level
          </label>
          <div className="relative">
            <Award className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <select
              {...register('experience_level')}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100"
            >
              <option value="Beginner">Beginner (0-1 year experience)</option>
              <option value="Intermediate">Intermediate (1-2 years experience)</option>
              <option value="Advanced">Advanced (Projects/Internships)</option>
            </select>
          </div>
        </div>

        {/* Daily Prep Minutes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Daily Preparation Goal (Minutes)
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              {...register('daily_preparation_minutes', { valueAsNumber: true })}
              type="number"
              min={15}
              max={480}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Known Technologies */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Known Technologies & Concepts
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={knownTechInput}
            onChange={(e) => setKnownTechInput(e.target.value)}
            placeholder="e.g. React, TypeScript, Git"
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddKnown();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddKnown}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {knownTechs.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs rounded-lg"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => handleRemoveKnown(tech)}
                className="hover:text-red-400 ml-1 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Weak Technologies */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Target Areas for Improvement (Weak Technologies)
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={weakTechInput}
            onChange={(e) => setWeakTechInput(e.target.value)}
            placeholder="e.g. System Design, Web Performance"
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddWeak();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddWeak}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {weakTechs.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs rounded-lg"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => handleRemoveWeak(tech)}
                className="hover:text-red-400 ml-1 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Complete Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
