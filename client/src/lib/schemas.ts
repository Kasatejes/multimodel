import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  university: z.string().optional(),
  current_year: z.string().optional(),
  target_role: z.enum(['Frontend Developer', 'Backend Developer', 'Full-Stack Developer']),
  experience_level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  preferred_difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  daily_preparation_minutes: z.number().min(15).max(480).default(60),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileFormInput = z.infer<typeof profileFormSchema>;
