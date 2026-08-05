import { z } from 'zod';

// 1. Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// 2. Profile Schema
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  university: z.string().optional().or(z.literal('')),
  current_year: z.string().optional().or(z.literal('')),
  target_role: z.enum(['Frontend Developer', 'Backend Developer', 'Full-Stack Developer']),
  experience_level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  preferred_difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  known_technologies: z.array(z.string()).default([]),
  weak_technologies: z.array(z.string()).default([]),
  daily_preparation_minutes: z.number().min(15).max(480).default(60),
  onboarding_completed: z.boolean().default(true),
});

// 3. Interview Setup Schema
export const interviewSetupSchema = z.object({
  target_role: z.enum(['Frontend Developer', 'Backend Developer', 'Full-Stack Developer']),
  interview_type: z.enum(['Technical', 'HR', 'Mixed']),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  total_questions: z.number().int().refine((val) => [3, 5, 10].includes(val), {
    message: 'Question count must be 3, 5, or 10',
  }),
});

// 4. Student Answer Schema
export const studentAnswerSchema = z.object({
  student_answer: z
    .string()
    .min(5, 'Answer is too short (minimum 5 characters)')
    .max(5000, 'Answer exceeds maximum limit of 5000 characters'),
});

// 5. Gemini Question Response Schema (Internal backend verification)
export const geminiQuestionSchema = z.object({
  question: z.string().min(5),
  topic: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  skill_tested: z.string().default('Core domain understanding'),
  expected_points: z.array(z.string()).min(1),
});

// 6. Gemini Answer Evaluation Response Schema
export const geminiEvaluationSchema = z.object({
  score: z.number().min(0).max(10),
  result: z.string(),
  correct_points: z.array(z.string()).default([]),
  missing_points: z.array(z.string()).default([]),
  incorrect_points: z.array(z.string()).default([]),
  technical_feedback: z.string(),
  communication_feedback: z.string(),
  improved_answer: z.string(),
  follow_up_question: z.string().optional().default(''),
  recommended_topic: z.string().optional().default(''),
});

// 7. Final Report Response Schema
export const geminiFinalReportSchema = z.object({
  overall_score: z.number().min(0).max(100),
  performance_level: z.string(),
  strong_areas: z.array(z.string()).default([]),
  weak_areas: z.array(z.string()).default([]),
  technical_summary: z.string(),
  communication_summary: z.string(),
  topics_to_revise: z.array(z.string()).length(3),
  next_difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  final_message: z.string(),
});

// 8. Study Plan Response Schema
export const geminiStudyPlanSchema = z.object({
  plan_title: z.string(),
  days: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        topic: z.string(),
        objective: z.string(),
        learning_activity: z.string(),
        practice_activity: z.string(),
        duration_minutes: z.number().int().positive(),
      })
    )
    .length(7),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type InterviewSetupInput = z.infer<typeof interviewSetupSchema>;
export type StudentAnswerInput = z.infer<typeof studentAnswerSchema>;
export type GeminiQuestion = z.infer<typeof geminiQuestionSchema>;
export type GeminiEvaluation = z.infer<typeof geminiEvaluationSchema>;
export type GeminiFinalReport = z.infer<typeof geminiFinalReportSchema>;
export type GeminiStudyPlan = z.infer<typeof geminiStudyPlanSchema>;
