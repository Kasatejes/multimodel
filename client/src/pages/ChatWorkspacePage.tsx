import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../lib/axios';
import { FileUploadModal } from '../components/FileUploadModal';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import {
  MessageSquare,
  Send,
  Plus,
  Paperclip,
  Pin,
  Trash2,
  Sparkles,
  FileText,
  Check,
  X,
  Loader2,
  Bot,
  User,
  Copy,
  UploadCloud,
  Search,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Music,
  Video,
  Mic,
  RotateCcw,
  SquareSquare,
  Wand2,
  ShieldCheck,
  AlertTriangle,
  Info,
  Download
} from 'lucide-react';

export const ChatWorkspacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { activeWorkspace } = useWorkspace();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(searchParams.get('id'));
  const [messages, setMessages] = useState<any[]>([]);
  const [workspaceFiles, setWorkspaceFiles] = useState<any[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '');
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Audio Recording State for Whisper
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { isListening, isSupported, toggleListening } = useVoiceSearch({
    onResult: (text) => {
      setPrompt(text);
    }
  });

  // Fetch Chat Threads & Workspace Files
  const fetchChatsAndFiles = async () => {
    try {
      const wsId = activeWorkspace?.id;
      const [chatsRes, filesRes] = await Promise.all([
        api.get(`/chats${wsId ? `?workspace_id=${wsId}` : ''}`),
        api.get(`/files${wsId ? `?workspace_id=${wsId}` : ''}`)
      ]);

      const chatList = chatsRes.data.chats || [];
      setChats(chatList);
      setWorkspaceFiles(filesRes.data.files || []);

      if (!activeChatId && chatList.length > 0) {
        setActiveChatId(chatList[0].id);
      }
    } catch (e) {
      console.error('Failed to load chat workspace:', e);
    }
  };

  useEffect(() => {
    fetchChatsAndFiles();
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeChatId) {
      api.get(`/chats/${activeChatId}/messages`).then((res) => {
        setMessages(res.data.messages || []);
      });
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateNewChat = async () => {
    try {
      const res = await api.post('/chats', {
        workspace_id: activeWorkspace?.id,
        title: 'New Multimodal Chat'
      });
      const newChat = res.data.chat;
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setMessages([]);
    } catch (e) {
      console.error('Error creating chat:', e);
    }
  };

  const handleSendMessage = async (customPrompt?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || prompt;
    if (!promptToSend.trim() || sending) return;

    setPrompt('');
    setSending(true);

    let currentChatId = activeChatId;

    if (!currentChatId) {
      try {
        const res = await api.post('/chats', {
          workspace_id: activeWorkspace?.id,
          title: promptToSend.substring(0, 30) + '...'
        });
        currentChatId = res.data.chat.id;
        setActiveChatId(currentChatId);
        setChats((prev) => [res.data.chat, ...prev]);
      } catch (e) {
        console.error('Failed to auto create chat:', e);
      }
    }

    const optimisticUserMsg = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: promptToSend,
      attachments: selectedFileIds
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const res = await api.post('/ai/chat', {
        prompt: promptToSend,
        chat_id: currentChatId,
        workspace_id: activeWorkspace?.id,
        file_ids: selectedFileIds
      });

      const replyMsg = {
        id: `reply_${Date.now()}`,
        role: 'model',
        content: res.data.reply
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          content: `⚠️ ${err.response?.data?.error || 'Error generating AI response. Please check security policies or network.'}`
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  // Direct Audio Recording for Whisper Transcription
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            setSending(true);
            const res = await api.post('/ai/transcribe', {
              audio_base64: base64Audio,
              filename: `voice_recording_${Date.now()}.mp3`,
              workspace_id: activeWorkspace?.id
            });
            const text = res.data.transcript?.transcript || '';
            if (text) {
              setPrompt(text);
              handleSendMessage(text);
            }
          } catch (err) {
            console.error('Whisper Transcription error:', err);
          } finally {
            setSending(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const togglePinChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/chats/${id}/pin`);
      setChats((prev) => prev.map((c) => (c.id === id ? { ...c, is_pinned: res.data.is_pinned } : c)));
    } catch (e) {}
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/chats/${id}`);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) setActiveChatId(null);
    } catch (e) {}
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getFileCategoryIcon = (type?: string) => {
    if (type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-pink-400" />;
    if (type === 'audio') return <Music className="w-3.5 h-3.5 text-amber-400" />;
    if (type === 'video') return <Video className="w-3.5 h-3.5 text-cyan-400" />;
    return <FileText className="w-3.5 h-3.5 text-purple-400" />;
  };

  const filteredWorkspaceFiles = workspaceFiles.filter((f) =>
    f.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-85px)] flex gap-4 overflow-hidden">
      {/* Left Chat History List */}
      <div className="w-64 glass-panel border border-purple-500/20 rounded-3xl p-3 hidden md:flex flex-col justify-between">
        <div className="space-y-3">
          <button
            onClick={handleCreateNewChat}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Chat Thread
          </button>

          <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider px-2">
            Conversation History ({chats.length})
          </p>

          <div className="space-y-1 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-2.5 rounded-xl text-xs font-medium cursor-pointer flex items-center justify-between group transition-all ${
                  activeChatId === chat.id
                    ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-glow-purple'
                    : 'text-gray-400 hover:bg-purple-950/40 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => togglePinChat(chat.id, e)} className="p-1 hover:text-purple-300">
                    <Pin className={`w-3 h-3 ${chat.is_pinned ? 'text-purple-400 fill-purple-400' : ''}`} />
                  </button>
                  <button onClick={(e) => deleteChat(chat.id, e)} className="p-1 hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat View */}
      <div className="flex-1 glass-panel border border-purple-500/20 rounded-3xl flex flex-col justify-between overflow-hidden relative">
        {/* Messages / Welcome Screen */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
            /* PART 5: ELEGANT CENTERED CHATGPT WELCOME SCREEN */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-glow-purple animate-pulse">
                <div className="w-full h-full bg-dark-950 rounded-[22px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-300" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                  Nexus AI
                </h1>
                <p className="text-xs font-semibold text-purple-300">Your Multimodal AI Workspace</p>

                <blockquote className="text-xs italic text-gray-400 pt-2 border-t border-purple-500/20 max-w-md mx-auto">
                  "Think Beyond Text. Understand Every File. Create Without Limits."
                </blockquote>
              </div>

              {/* Quick Action Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-3.5 rounded-2xl bg-dark-900/80 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-400 text-center space-y-1.5 transition-all group"
                >
                  <FileText className="w-5 h-5 text-purple-400 mx-auto group-hover:scale-110 transition-transform" />
                  <span className="block text-[11px] font-bold text-gray-200">Upload PDF</span>
                </button>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-3.5 rounded-2xl bg-dark-900/80 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-400 text-center space-y-1.5 transition-all group"
                >
                  <ImageIcon className="w-5 h-5 text-pink-400 mx-auto group-hover:scale-110 transition-transform" />
                  <span className="block text-[11px] font-bold text-gray-200">Upload Image</span>
                </button>

                <button
                  onClick={startAudioRecording}
                  className="p-3.5 rounded-2xl bg-dark-900/80 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-400 text-center space-y-1.5 transition-all group"
                >
                  <Music className="w-5 h-5 text-amber-400 mx-auto group-hover:scale-110 transition-transform" />
                  <span className="block text-[11px] font-bold text-gray-200">Upload Audio</span>
                </button>

                <button
                  onClick={toggleListening}
                  className="p-3.5 rounded-2xl bg-dark-900/80 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-400 text-center space-y-1.5 transition-all group"
                >
                  <Mic className="w-5 h-5 text-cyan-400 mx-auto group-hover:scale-110 transition-transform animate-pulse" />
                  <span className="block text-[11px] font-bold text-gray-200">Voice Chat</span>
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white border-purple-400/40'
                      : 'bg-dark-900 text-purple-400 border-purple-500/30 shadow-glow-purple'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed border space-y-2 relative group ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-700/60 to-indigo-700/60 text-white border-purple-500/40'
                      : 'bg-dark-900/90 text-gray-200 border-purple-500/20'
                  }`}
                >
                  {/* AI Generated & Security Badges (Part 6 & 7) */}
                  {msg.role === 'model' && (
                    <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 text-[9px] text-purple-300 font-bold">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-green-400" /> AI Generated Output
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> Verify facts
                      </span>
                    </div>
                  )}

                  {(() => {
                    const rawContent = msg.content;
                    const safeContent = typeof rawContent === 'string'
                      ? rawContent
                      : typeof rawContent === 'object' && rawContent !== null
                        ? (rawContent.error || rawContent.message || JSON.stringify(rawContent))
                        : String(rawContent || '');

                    const imgMatch = safeContent.match(/!\[(.*?)\]\((data:image\/[^)]+)\)/);
                    if (imgMatch) {
                      const altText = imgMatch[1];
                      const imgSrc = imgMatch[2];
                      const textAfter = safeContent.replace(/!\[(.*?)\]\((data:image\/[^)]+)\)/, '').trim();
                      return (
                        <div className="space-y-3 my-1">
                          <div className="relative overflow-hidden rounded-2xl border border-purple-500/40 shadow-glow-purple bg-dark-950/90 p-1 group/img">
                            <img src={imgSrc} alt={altText} className="w-full max-h-[450px] object-contain rounded-xl" />
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                              <a
                                href={imgSrc}
                                download={`nexus-ai-image-${Date.now()}.png`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-600 border border-purple-500/50 text-white font-extrabold text-[11px] shadow-lg transition-all"
                                title="Download AI Image"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Image</span>
                              </a>
                            </div>
                          </div>
                          {textAfter && <div className="whitespace-pre-wrap font-sans text-xs">{textAfter}</div>}
                        </div>
                      );
                    }
                    return <div className="whitespace-pre-wrap font-sans">{safeContent}</div>;
                  })()}

                  {msg.role === 'model' && (
                    <div className="flex items-center justify-end gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1 text-gray-400 hover:text-purple-300"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleSendMessage(msg.content)}
                        className="p-1 text-gray-400 hover:text-purple-300"
                        title="Regenerate"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex items-center gap-3 text-purple-300 text-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>Nexus AI is formulating multimodal response...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar with Voice & Whisper Dictation */}
        <div className="p-4 border-t border-purple-500/20 bg-dark-950/80">
          {isRecordingAudio && (
            <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-red-950/80 border border-red-500/40 text-[10px] text-red-200 animate-pulse">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-red-400 animate-bounce" /> Recording audio dictation for OpenAI Whisper...
              </span>
              <button onClick={stopAudioRecording} className="font-bold text-white hover:underline">
                Stop & Transcribe
              </button>
            </div>
          )}

          <form onSubmit={(e) => handleSendMessage(undefined, e)} className="flex items-center gap-2 relative">
            <button
              type="button"
              onClick={() => setShowFilePicker(!showFilePicker)}
              className={`p-2.5 rounded-xl glass-input transition-all ${
                selectedFileIds.length > 0
                  ? 'text-purple-300 border-purple-400 bg-purple-900/40 shadow-glow-purple'
                  : 'text-purple-400 hover:text-purple-300 hover:border-purple-400'
              }`}
              title="Attach workspace documents"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* File Picker Popover */}
            {showFilePicker && (
              <div className="absolute bottom-14 left-0 w-80 glass-panel rounded-2xl border border-purple-500/40 p-3.5 shadow-2xl z-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                    Attach Workspace Files
                  </span>
                  <button onClick={() => setShowFilePicker(false)} className="text-gray-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3 h-3 text-purple-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    placeholder="Search workspace files..."
                    className="w-full pl-7 pr-2 py-1.5 rounded-xl glass-input text-[11px]"
                  />
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {filteredWorkspaceFiles.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <div
                        key={file.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFileIds((prev) => prev.filter((id) => id !== file.id));
                          } else {
                            setSelectedFileIds((prev) => [...prev, file.id]);
                          }
                        }}
                        className={`p-2 rounded-xl text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-purple-600/40 border border-purple-400/40 text-white font-semibold' : 'text-gray-300 hover:bg-purple-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {getFileCategoryIcon(file.file_type)}
                          <span className="truncate">{file.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening... Speak into microphone...'
                    : selectedFileIds.length > 0
                    ? `Asking Nexus AI about ${selectedFileIds.length} attached document(s)...`
                    : 'Ask Nexus AI anything or speak prompt...'
                }
                className={`w-full pl-4 pr-10 py-3 rounded-2xl glass-input text-xs transition-all ${
                  isListening ? 'border-purple-400 ring-2 ring-purple-500/40 bg-purple-950/30' : ''
                }`}
              />

              {isSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-2.5 p-1.5 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse shadow-glow-purple ring-2 ring-red-400'
                      : 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/40'
                  }`}
                  title="Voice dictation"
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-white' : ''}`} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || sending}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white shadow-glow-purple transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {showUploadModal && (
        <FileUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchChatsAndFiles}
        />
      )}
    </div>
  );
};
