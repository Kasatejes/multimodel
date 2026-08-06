import { describe, it, expect } from 'vitest';
import {
  interviewSetupSchema,
  studentAnswerSchema,
  geminiQuestionSchema,
  geminiEvaluationSchema,
} from '../validation/schemas.js';

describe('Validation Schemas Unit Tests', () => {
  it('should validate valid interview setup payload', () => {
    const payload = {
      target_role: 'Frontend Developer',
      interview_type: 'Technical',
      topic: 'React',
      difficulty: 'Easy',
      total_questions: 3,
    };
    const result = interviewSetupSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should reject invalid question count in interview setup', () => {
    const payload = {
      target_role: 'Frontend Developer',
      interview_type: 'Technical',
      topic: 'React',
      difficulty: 'Easy',
      total_questions: 7, // allowed: 3, 5, 10
    };
    const result = interviewSetupSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should validate valid student answer', () => {
    const payload = {
      student_answer: 'React uses a virtual DOM to optimize UI updates by computing diffs before mutating the real DOM.',
    };
    const result = studentAnswerSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should reject extremely short student answer', () => {
    const payload = {
      student_answer: 'No',
    };
    const result = studentAnswerSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should validate Gemini question AI response structure', () => {
    const aiResponse = {
      question: 'Explain the difference between props and state in React.',
      topic: 'React',
      difficulty: 'Easy',
      skill_tested: 'State management fundamentals',
      expected_points: ['Props are read-only inputs passed from parent', 'State is managed internally by component'],
    };
    const result = geminiQuestionSchema.safeParse(aiResponse);
    expect(result.success).toBe(true);
  });

  it('should validate Gemini evaluation AI response structure', () => {
    const evalResponse = {
      score: 8.5,
      result: 'Great understanding of core concepts',
      correct_points: ['Identified virtual DOM diffing'],
      missing_points: ['Did not mention synthetic events'],
      incorrect_points: [],
      technical_feedback: 'Solid technical explanation.',
      communication_feedback: 'Clear and concise presentation.',
      improved_answer: 'An ideal response would mention reconciliation process.',
      recommended_topic: 'React Reconciliation',
    };
    const result = geminiEvaluationSchema.safeParse(evalResponse);
    expect(result.success).toBe(true);
  });
});
