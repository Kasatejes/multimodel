import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../lib/axios';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  FileText
} from 'lucide-react';

export const StudyHubPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspace } = useWorkspace();

  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'notes');
  const [workspaceFiles, setWorkspaceFiles] = useState<any[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');

  const [notes, setNotes] = useState<any[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [timelines, setTimelines] = useState<any[]>([]);

  const [generating, setGenerating] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const fetchStudyData = async () => {
    try {
      const wsId = activeWorkspace?.id;
      const [filesRes, notesRes, cardsRes, quizRes, intRes, timeRes] = await Promise.all([
        api.get(`/files${wsId ? `?workspace_id=${wsId}` : ''}`),
        api.get(`/study/notes${wsId ? `?workspace_id=${wsId}` : ''}`),
        api.get(`/study/flashcards${wsId ? `?workspace_id=${wsId}` : ''}`),
        api.get(`/study/quizzes${wsId ? `?workspace_id=${wsId}` : ''}`),
        api.get(`/study/interviews${wsId ? `?workspace_id=${wsId}` : ''}`),
        api.get(`/study/timelines${wsId ? `?workspace_id=${wsId}` : ''}`)
      ]);

      const fList = filesRes.data.files || [];
      setWorkspaceFiles(fList);
      if (fList.length > 0 && !selectedFileId) {
        setSelectedFileId(fList[0].id);
      }

      setNotes(notesRes.data.notes || []);
      setFlashcardDecks(cardsRes.data.decks || []);
      setQuizzes(quizRes.data.quizzes || []);
      setInterviews(intRes.data.interviews || []);
      setTimelines(timeRes.data.timelines || []);
    } catch (e) {
      console.error('Error fetching study hub assets:', e);
    }
  };

  useEffect(() => {
    fetchStudyData();
  }, [activeWorkspace]);

  const handleGenerateAsset = async () => {
    setGenerating(true);
    try {
      if (activeTab === 'notes') {
        const res = await api.post('/ai/notes', { file_id: selectedFileId, workspace_id: activeWorkspace?.id });
        setNotes((prev) => [res.data.note, ...prev]);
      } else if (activeTab === 'flashcards') {
        const res = await api.post('/ai/flashcards', { file_id: selectedFileId, workspace_id: activeWorkspace?.id });
        setFlashcardDecks((prev) => [res.data.deck, ...prev]);
      } else if (activeTab === 'quizzes') {
        const res = await api.post('/ai/quiz', { file_id: selectedFileId, workspace_id: activeWorkspace?.id });
        setQuizzes((prev) => [res.data.quiz, ...prev]);
      } else if (activeTab === 'interviews') {
        const res = await api.post('/ai/interview', { file_id: selectedFileId, workspace_id: activeWorkspace?.id });
        setInterviews((prev) => [res.data.interview, ...prev]);
      } else if (activeTab === 'timeline') {
        const res = await api.post('/ai/timeline', { file_id: selectedFileId, workspace_id: activeWorkspace?.id });
        setTimelines((prev) => [res.data.timeline, ...prev]);
      }
    } catch (e) {
      console.error('Asset generation error:', e);
    } finally {
      setGenerating(false);
    }
  };

  const handleScoreQuizSubmit = async () => {
    if (!activeQuiz) return;
    let correct = 0;
    activeQuiz.questions.forEach((q: any, idx: number) => {
      if (selectedAnswers[idx] === q.correct_index) correct++;
    });
    const finalScore = Math.round((correct / activeQuiz.questions.length) * 100);
    setScore(finalScore);
    setQuizSubmitted(true);

    try {
      await api.post(`/study/quizzes/${activeQuiz.id}/score`, { score: finalScore });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" /> Study & Productivity Hub
          </h1>
          <p className="text-xs text-gray-400">
            Generate notes, flashcard decks, quizzes, interview questions, and timelines from your workspace files.
          </p>
        </div>

        {/* Generator Controls */}
        <div className="flex items-center gap-2 bg-dark-900/80 p-2 rounded-2xl border border-purple-500/30">
          <select
            value={selectedFileId}
            onChange={(e) => setSelectedFileId(e.target.value)}
            className="bg-transparent text-xs text-purple-200 focus:outline-none max-w-[160px] truncate"
          >
            {workspaceFiles.map((f) => (
              <option key={f.id} value={f.id} className="bg-dark-950 text-white">
                {f.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerateAsset}
            disabled={generating || !selectedFileId}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-glow-purple transition-all shrink-0"
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate {activeTab.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-purple-500/20 pb-2 overflow-x-auto">
        {[
          { id: 'notes', label: 'Study Notes', icon: BookOpen },
          { id: 'flashcards', label: 'Flashcards', icon: Sparkles },
          { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
          { id: 'interviews', label: 'Interview Prep', icon: Briefcase },
          { id: 'timeline', label: 'Action Timeline', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-glow-purple'
                  : 'text-gray-400 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Notes View */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {notes.length === 0 ? (
            <div className="lg:col-span-3 text-center py-12 glass-panel rounded-3xl border border-purple-500/20">
              <BookOpen className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
              <p className="text-xs text-gray-300 font-medium">No study notes generated yet.</p>
              <p className="text-[10px] text-gray-500 mt-1">Select a document above and click "Generate NOTES".</p>
            </div>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="p-5 rounded-3xl glass-panel border border-purple-500/20 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  {n.title}
                  <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">Note</span>
                </h3>
                <div className="prose prose-invert prose-xs max-h-60 overflow-y-auto pr-1 text-gray-300 whitespace-pre-wrap font-sans text-xs bg-dark-950/50 p-3 rounded-xl border border-purple-500/10">
                  {n.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Flashcards Interactive 3D Card Flipper */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {flashcardDecks.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-3xl border border-purple-500/20">
              <Sparkles className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
              <p className="text-xs text-gray-300 font-medium">No flashcard decks generated yet.</p>
            </div>
          ) : (
            flashcardDecks.map((deck) => {
              const cards = deck.cards || [];
              const currentCard = cards[activeCardIndex] || cards[0];
              return (
                <div key={deck.id} className="p-6 rounded-3xl glass-panel border border-purple-500/20 space-y-4 max-w-xl mx-auto">
                  <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
                    <span>{deck.deck_title}</span>
                    <span>
                      Card {activeCardIndex + 1} of {cards.length}
                    </span>
                  </div>

                  {/* 3D Flip Card Container */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="h-64 w-full rounded-2xl glass-panel border border-purple-500/40 p-6 flex flex-col justify-center items-center text-center cursor-pointer shadow-glow-purple transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    {!isFlipped ? (
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold block mb-2">Question</span>
                        <h3 className="text-base font-bold text-white">{currentCard?.question}</h3>
                        <p className="text-[10px] text-gray-500 mt-4">(Click card to reveal answer)</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block mb-2">Answer</span>
                        <p className="text-xs text-gray-200 leading-relaxed font-sans">{currentCard?.answer}</p>
                      </div>
                    )}
                  </div>

                  {/* Flip Navigation */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-dark-900 border border-purple-500/30 text-xs font-semibold text-gray-300 hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveCardIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 text-xs font-bold text-white shadow-glow-purple"
                    >
                      Next Card <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Interactive Quiz Runner */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {activeQuiz ? (
            <div className="p-6 rounded-3xl glass-panel border border-purple-500/30 max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
                <h3 className="text-base font-extrabold text-white">{activeQuiz.title}</h3>
                <button onClick={() => setActiveQuiz(null)} className="text-xs text-purple-400 underline">
                  Back to All Quizzes
                </button>
              </div>

              <div className="space-y-6">
                {activeQuiz.questions.map((q: any, qIdx: number) => (
                  <div key={q.id || qIdx} className="p-4 rounded-2xl bg-dark-950/80 border border-purple-500/20 space-y-3">
                    <h4 className="text-xs font-bold text-white">
                      {qIdx + 1}. {q.question}
                    </h4>

                    <div className="space-y-2">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx;
                        const isCorrect = q.correct_index === optIdx;

                        let optionStyle = 'bg-dark-900 border-purple-500/20 text-gray-300';
                        if (quizSubmitted) {
                          if (isCorrect) optionStyle = 'bg-green-950/80 border-green-500 text-green-200';
                          else if (isSelected && !isCorrect) optionStyle = 'bg-red-950/80 border-red-500 text-red-200';
                        } else if (isSelected) {
                          optionStyle = 'bg-purple-600/40 border-purple-400 text-white shadow-glow-purple';
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => !quizSubmitted && setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                            className={`p-3 rounded-xl text-xs font-medium border cursor-pointer transition-all flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                          </div>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/30 text-[11px] text-purple-200">
                        💡 <span className="font-bold">Explanation:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleScoreQuizSubmit}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-glow-purple"
                >
                  Submit & Score Quiz
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400 text-center space-y-1">
                  <h4 className="text-sm font-extrabold text-white">Quiz Completed!</h4>
                  <p className="text-xl font-black text-purple-300">Score: {score}%</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.length === 0 ? (
                <div className="col-span-3 text-center py-12 glass-panel rounded-3xl border border-purple-500/20">
                  <HelpCircle className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
                  <p className="text-xs text-gray-300 font-medium">No quizzes generated yet.</p>
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => {
                      setActiveQuiz(quiz);
                      setSelectedAnswers({});
                      setQuizSubmitted(false);
                      setScore(null);
                    }}
                    className="p-5 rounded-3xl glass-panel border border-purple-500/20 glass-panel-hover cursor-pointer space-y-3"
                  >
                    <h3 className="text-sm font-bold text-white">{quiz.title}</h3>
                    <p className="text-[10px] text-gray-400">{quiz.questions.length} Multiple Choice Questions</p>
                    {quiz.score !== null && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Last Score: {quiz.score}%
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Technical Interview Prep */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-3xl border border-purple-500/20">
              <Briefcase className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
              <p className="text-xs text-gray-300 font-medium">No interview sessions generated yet.</p>
            </div>
          ) : (
            interviews.map((int) => (
              <div key={int.id} className="p-6 rounded-3xl glass-panel border border-purple-500/20 space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" /> Target Role: {int.role_target}
                </h3>
                <div className="space-y-3">
                  {int.questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-dark-950/80 border border-purple-500/20 space-y-2">
                      <h4 className="text-xs font-bold text-purple-200">
                        Q{idx + 1}: {q.question}
                      </h4>
                      <p className="text-xs text-gray-300 font-sans leading-relaxed">
                        <strong className="text-white">Model Answer:</strong> {q.model_answer}
                      </p>
                      <p className="text-[10px] text-purple-400">💡 Tip: {q.tips}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Action Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {timelines.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-3xl border border-purple-500/20">
              <Clock className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
              <p className="text-xs text-gray-300 font-medium">No timelines extracted yet.</p>
            </div>
          ) : (
            timelines.map((tl) => (
              <div key={tl.id} className="p-6 rounded-3xl glass-panel border border-purple-500/20 space-y-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" /> {tl.title}
                </h3>

                {/* Action items table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-purple-500/20 text-purple-400 text-[10px] uppercase">
                        <th className="py-2 px-3">Task</th>
                        <th className="py-2 px-3">Assignee</th>
                        <th className="py-2 px-3">Due Date</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {tl.action_items?.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2.5 px-3 font-semibold text-white">{item.task}</td>
                          <td className="py-2.5 px-3 text-gray-400">{item.assignee}</td>
                          <td className="py-2.5 px-3 text-gray-400">{item.due_date}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
