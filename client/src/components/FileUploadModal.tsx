import React, { useState, useRef } from 'react';
import { api } from '../lib/axios';
import { useWorkspace } from '../context/WorkspaceContext';
import { X, UploadCloud, FileText, Image as ImageIcon, Music, Video, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ onClose, onSuccess }) => {
  const { activeWorkspace } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-pink-400" />;
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5 text-amber-400" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5 text-cyan-400" />;
    return <FileText className="w-5 h-5 text-purple-400" />;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setProgress(20);

    const formData = new FormData();
    if (activeWorkspace?.id) {
      formData.append('workspace_id', activeWorkspace.id);
    }
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setProgress(60);
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProgress(100);
      setSuccessMsg(res.data.message || 'Files uploaded and processed successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-purple-500/40 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-purple-900/40"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold text-white mb-1 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-purple-400" />
          Multimodal File Upload
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Upload PDF, Images, Audio, Video, DOCX, PPTX, TXT, or CSV to{' '}
          <span className="text-purple-300 font-medium">{activeWorkspace?.name || 'General Workspace'}</span>
        </p>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-400 bg-purple-900/30 shadow-glow-purple'
              : 'border-purple-500/30 hover:border-purple-400/60 bg-dark-900/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept=".pdf,.docx,.pptx,.txt,.csv,image/*,audio/*,video/*"
          />
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center shadow-glow-purple">
              <UploadCloud className="w-6 h-6 text-purple-300" />
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-200 mb-1">
            Drag & Drop files here, or <span className="text-purple-400 underline">browse</span>
          </p>
          <p className="text-[10px] text-gray-400">
            Supports PDF, DOCX, PPTX, CSV, TXT, JPG, PNG, MP3, MP4 up to 50MB
          </p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* File Preview List */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
            <p className="text-[11px] font-bold uppercase text-purple-400 tracking-wider">
              Selected Files ({selectedFiles.length})
            </p>
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-dark-900/80 border border-purple-500/20 text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {getFileIcon(file)}
                  <span className="font-medium text-gray-200 truncate">{file.name}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-gray-400 hover:text-red-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[11px] text-purple-300">
              <span>Uploading & Analyzing with Gemini...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-dark-950 rounded-full h-2 overflow-hidden border border-purple-500/30">
              <div
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-purple-900/30"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-glow-purple transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upload to Workspace'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
