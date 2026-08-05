import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { interviewSetupSchema, studentAnswerSchema } from '../validation/schemas.js';
import { generateQuestion, evaluateAnswer, generateFinalReport } from '../services/geminiService.js';

export async function startInterview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const validation = interviewSetupSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ success: false, error: 'Validation error', details: validation.error.format() });
      return;
    }

    const { target_role, interview_type, topic, difficulty, total_questions } = validation.data;

    // Fetch student profile for extra context
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 1. Create session record
    const { data: session, error: createError } = await supabaseAdmin
      .from('interview_sessions')
      .insert({
        user_id: userId,
        target_role,
        interview_type,
        topic,
        difficulty,
        total_questions,
        current_question_number: 1,
        status: 'in_progress',
        processing_status: 'generating_question',
      })
      .select()
      .single();

    if (createError || !session) {
      console.error('[InterviewController] Session creation error:', createError);
      res.status(500).json({ success: false, error: 'Failed to create interview session' });
      return;
    }

    // 2. Call Gemini to generate first question
    let questionData;
    try {
      questionData = await generateQuestion({
        target_role,
        interview_type,
        topic,
        difficulty,
        experience_level: profile?.experience_level || 'Beginner',
        weak_areas: profile?.weak_technologies || [],
      });
    } catch (aiError: any) {
      console.error('[InterviewController] AI Question generation error:', aiError);
      await supabaseAdmin.from('interview_sessions').update({ status: 'failed', processing_status: 'failed' }).eq('id', session.id);
      res.status(500).json({ success: false, error: 'Failed to generate interview question via AI coach. Please try again.' });
      return;
    }

    // 3. Store question in database
    const { data: insertedQuestion, error: qError } = await supabaseAdmin
      .from('interview_questions')
      .insert({
        session_id: session.id,
        user_id: userId,
        question: questionData.question,
        topic: questionData.topic || topic,
        difficulty: questionData.difficulty || difficulty,
        skill_tested: questionData.skill_tested,
        expected_points: questionData.expected_points,
        question_order: 1,
      })
      .select()
      .single();

    if (qError || !insertedQuestion) {
      console.error('[InterviewController] Question insert error:', qError);
      res.status(500).json({ success: false, error: 'Failed to save question' });
      return;
    }

    // 4. Update session processing status to question_ready
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'question_ready' })
      .eq('id', session.id);

    // 5. Return response with sanitized question (expected_points hidden from frontend)
    const sanitizedQuestion = {
      id: insertedQuestion.id,
      session_id: insertedQuestion.session_id,
      question: insertedQuestion.question,
      topic: insertedQuestion.topic,
      difficulty: insertedQuestion.difficulty,
      skill_tested: insertedQuestion.skill_tested,
      question_order: insertedQuestion.question_order,
    };

    res.json({
      success: true,
      data: {
        session: { ...session, processing_status: 'question_ready' },
        question: sanitizedQuestion,
      },
    });
  } catch (err: any) {
    console.error('[InterviewController] Start interview error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function listInterviews(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const { data: sessions, error } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch interview history' });
      return;
    }

    res.json({ success: true, data: sessions || [] });
  } catch (err: any) {
    console.error('[InterviewController] List interviews error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getInterviewById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id;

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      res.status(404).json({ success: false, error: 'Interview session not found' });
      return;
    }

    if (session.user_id !== userId) {
      res.status(403).json({ success: false, error: 'Forbidden: Access denied' });
      return;
    }

    // Fetch questions and answers
    const { data: questions } = await supabaseAdmin
      .from('interview_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });

    const { data: answers } = await supabaseAdmin
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId);

    const answeredQuestionIds = new Set(answers?.map((a) => a.question_id) || []);

    // Sanitize questions to hide expected_points unless question was already answered
    const sanitizedQuestions = (questions || []).map((q) => {
      if (answeredQuestionIds.has(q.id) || session.status === 'completed') {
        return q;
      }
      const { expected_points, ...rest } = q;
      return rest;
    });

    res.json({
      success: true,
      data: {
        session,
        questions: sanitizedQuestions,
        answers: answers || [],
      },
    });
  } catch (err: any) {
    console.error('[InterviewController] Get interview by ID error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function generateNextQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id;

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    if (session.user_id !== userId) {
      res.status(403).json({ success: false, error: 'Forbidden: Access denied' });
      return;
    }

    if (session.status === 'completed') {
      res.status(400).json({ success: false, error: 'Interview session is already completed' });
      return;
    }

    // Fetch existing questions
    const { data: existingQuestions } = await supabaseAdmin
      .from('interview_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });

    const askedCount = existingQuestions?.length || 0;
    if (askedCount >= session.total_questions) {
      res.status(400).json({ success: false, error: 'All questions for this session have already been generated' });
      return;
    }

    const nextOrder = askedCount + 1;

    // Update processing status
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'generating_question', current_question_number: nextOrder })
      .eq('id', sessionId);

    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();

    const previousQuestionsList = existingQuestions?.map((q) => q.question) || [];

    const questionData = await generateQuestion({
      target_role: session.target_role,
      interview_type: session.interview_type,
      topic: session.topic,
      difficulty: session.difficulty,
      experience_level: profile?.experience_level || 'Beginner',
      previous_questions: previousQuestionsList,
      weak_areas: profile?.weak_technologies || [],
    });

    const { data: insertedQuestion, error: qError } = await supabaseAdmin
      .from('interview_questions')
      .insert({
        session_id: sessionId,
        user_id: userId,
        question: questionData.question,
        topic: questionData.topic || session.topic,
        difficulty: questionData.difficulty || session.difficulty,
        skill_tested: questionData.skill_tested,
        expected_points: questionData.expected_points,
        question_order: nextOrder,
      })
      .select()
      .single();

    if (qError || !insertedQuestion) {
      res.status(500).json({ success: false, error: 'Failed to save next question' });
      return;
    }

    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'question_ready' })
      .eq('id', sessionId);

    const { expected_points, ...sanitizedQuestion } = insertedQuestion;

    res.json({
      success: true,
      data: sanitizedQuestion,
    });
  } catch (err: any) {
    console.error('[InterviewController] Generate next question error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate next question' });
  }
}

export async function submitAnswer(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id;

    const validation = studentAnswerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, error: 'Validation error', details: validation.error.format() });
      return;
    }

    const { student_answer } = validation.data;

    // Fetch session
    const { data: session } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session || session.user_id !== userId) {
      res.status(403).json({ success: false, error: 'Forbidden or session not found' });
      return;
    }

    // Fetch latest question order
    const { data: questions } = await supabaseAdmin
      .from('interview_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: false });

    if (!questions || questions.length === 0) {
      res.status(400).json({ success: false, error: 'No question found for this interview session' });
      return;
    }

    const currentQuestion = questions[0];

    // Prevent duplicate answer submission for same question
    const { data: existingAnswer } = await supabaseAdmin
      .from('interview_answers')
      .select('*')
      .eq('question_id', currentQuestion.id)
      .single();

    if (existingAnswer) {
      res.status(400).json({ success: false, error: 'An answer has already been submitted for this question' });
      return;
    }

    // Update processing status
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'evaluating_answer' })
      .eq('id', sessionId);

    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();

    // Call Gemini evaluateAnswer
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'generating_feedback' })
      .eq('id', sessionId);

    const evaluation = await evaluateAnswer({
      question: currentQuestion.question,
      expected_points: currentQuestion.expected_points || [],
      student_answer,
      experience_level: profile?.experience_level || 'Beginner',
    });

    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'saving_result' })
      .eq('id', sessionId);

    // Save answer evaluation
    const { data: savedAnswer, error: ansError } = await supabaseAdmin
      .from('interview_answers')
      .insert({
        question_id: currentQuestion.id,
        session_id: sessionId,
        user_id: userId,
        student_answer,
        score: evaluation.score,
        result: evaluation.result,
        correct_points: evaluation.correct_points,
        missing_points: evaluation.missing_points,
        incorrect_points: evaluation.incorrect_points,
        technical_feedback: evaluation.technical_feedback,
        communication_feedback: evaluation.communication_feedback,
        improved_answer: evaluation.improved_answer,
        follow_up_question: evaluation.follow_up_question,
        recommended_topic: evaluation.recommended_topic,
      })
      .select()
      .single();

    if (ansError) {
      console.error('[InterviewController] Answer save error:', ansError);
      res.status(500).json({ success: false, error: 'Failed to save answer evaluation' });
      return;
    }

    // Update Progress table for user & topic
    const topicName = currentQuestion.topic || session.topic;
    const { data: existingProgress } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('topic', topicName)
      .single();

    if (existingProgress) {
      const newAttempts = existingProgress.attempts + 1;
      const newAverage =
        Math.round(
          ((existingProgress.average_score * existingProgress.attempts + evaluation.score) / newAttempts) * 10
        ) / 10;
      const newBest = Math.max(existingProgress.best_score, evaluation.score);

      await supabaseAdmin
        .from('progress')
        .update({
          attempts: newAttempts,
          average_score: newAverage,
          best_score: newBest,
          last_attempted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id);
    } else {
      await supabaseAdmin.from('progress').insert({
        user_id: userId,
        topic: topicName,
        attempts: 1,
        average_score: evaluation.score,
        best_score: evaluation.score,
        last_attempted_at: new Date().toISOString(),
      });
    }

    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'waiting' })
      .eq('id', sessionId);

    res.json({
      success: true,
      data: {
        evaluation: savedAnswer,
        question: currentQuestion,
      },
    });
  } catch (err: any) {
    console.error('[InterviewController] Submit answer error:', err);
    res.status(500).json({ success: false, error: 'Failed to evaluate student answer' });
  }
}

export async function completeInterview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id;

    const { data: session } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session || session.user_id !== userId) {
      res.status(403).json({ success: false, error: 'Forbidden or session not found' });
      return;
    }

    // Fetch all Q&As for session
    const { data: questions } = await supabaseAdmin
      .from('interview_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });

    const { data: answers } = await supabaseAdmin
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId);

    const qaList = (questions || []).map((q) => {
      const ans = (answers || []).find((a) => a.question_id === q.id);
      return {
        question: q.question,
        student_answer: ans?.student_answer || 'No answer provided',
        score: ans?.score || 0,
        technical_feedback: ans?.technical_feedback || '',
        recommended_topic: ans?.recommended_topic || '',
      };
    });

    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'generating_feedback' })
      .eq('id', sessionId);

    // Call Gemini to generate final report
    const report = await generateFinalReport({
      target_role: session.target_role,
      interview_type: session.interview_type,
      difficulty: session.difficulty,
      interview_results: qaList,
    });

    // Save final report to session
    const { data: updatedSession, error: updateError } = await supabaseAdmin
      .from('interview_sessions')
      .update({
        status: 'completed',
        processing_status: 'completed',
        overall_score: report.overall_score,
        performance_level: report.performance_level,
        strong_areas: report.strong_areas,
        weak_areas: report.weak_areas,
        technical_summary: report.technical_summary,
        communication_summary: report.communication_summary,
        topics_to_revise: report.topics_to_revise,
        next_difficulty: report.next_difficulty,
        final_message: report.final_message,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      res.status(500).json({ success: false, error: 'Failed to update final interview session report' });
      return;
    }

    res.json({
      success: true,
      data: updatedSession,
    });
  } catch (err: any) {
    console.error('[InterviewController] Complete interview error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate final report' });
  }
}
