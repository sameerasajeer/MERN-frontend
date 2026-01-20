import { Save, Trash2, Star, Edit3, Eye, Mic, MicOff, Video, Loader, Camera, ChevronLeft, RotateCcw } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import VideoRecorder from './VideoRecorder';
import { useEffect, useRef, useState } from 'react';

import { API_BASE } from '../config';

const NoteEditor = ({ note, onSave, onDelete, onToggleFavorite, onBack, isMobileView }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showVideoRecorder, setShowVideoRecorder] = useState(false);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setTags(note.tags ? note.tags.join(', ') : '');
            setIsDirty(false);
            setIsSaving(false);
        } else {
            setTitle('');
            setContent('');
            setTags('');
        }
    }, [note?._id]);

    useEffect(() => {
        if (!note || !isDirty) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            await handleSave();
        }, 2000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [title, content, tags, isDirty]);

    const handleSave = async () => {
        if (!isDirty) return;

        setIsSaving(true);
        const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
        try {
            await onSave({
                ...note,
                title,
                content,
                tags: tagsArray
            });
            setIsDirty(false);
        } catch (err) {
            console.error('Auto-save failed:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setIsDirty(true);
    }

    const handleContentChange = (e) => {
        setContent(e.target.value);
        setIsDirty(true);
    }

    const handleVideoFile = async (file) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('video', file);

        try {
            const res = await axios.post(`${API_BASE}/summarize-video`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 120000
            });

            const summary = res.data.summary;
            setContent(prev => prev + summary);
            setIsDirty(true);
        } catch (err) {
            console.error('Error uploading video:', err);
            const errorMessage = err.response?.data?.details || err.response?.data?.error || err.message || 'Unknown error';
            alert(`Failed to process video: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await handleVideoFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleRecording = () => {
        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
        } else {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert('Voice dictation is not supported in this browser. Please use Chrome or Edge.');
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript + ' ';
                    }
                }
                if (transcript) {
                    setContent(prev => prev + transcript);
                    setIsDirty(true);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
            setIsRecording(true);
        }
    };

    if (!note) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                <div className="text-center px-6">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Edit3 size={32} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Select a note to view</h2>
                    <p className="max-w-xs mb-6">Choose a note from the library or start a fresh one to begin writing.</p>
                    <button onClick={onBack} className="md:hidden px-6 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">Back to List</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* Toolbar */}
            <div className="h-16 md:h-20 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-600 md:hidden transition-colors"
                        title="Back to list"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Note Title"
                            className="text-lg md:text-xl font-bold text-gray-900 border-none focus:outline-none focus:ring-0 placeholder-gray-300 w-full bg-transparent truncate"
                        />
                        <div className="flex items-center space-x-2 mt-0.5">
                            {isSaving ? (
                                <span className="flex items-center text-[10px] text-blue-500 font-bold uppercase tracking-wider animate-pulse">
                                    <Loader size={10} className="animate-spin mr-1" />
                                    Saving...
                                </span>
                            ) : isDirty ? (
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    Unsaved
                                </span>
                            ) : note._id && (
                                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center">
                                    <div className="w-1 h-1 bg-green-500 rounded-full mr-1.5" />
                                    Saved
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-1 md:space-x-2">
                    <div className="hidden sm:flex items-center space-x-1">
                        <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleVideoUpload} />
                        <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className={`p-2 rounded-lg transition-all ${isUploading ? 'bg-blue-50 text-blue-500' : 'text-gray-400 hover:bg-gray-100'}`} title="Summarize Video">
                            {isUploading ? <Loader size={18} className="animate-spin" /> : <Video size={18} />}
                        </button>
                        <button onClick={() => setShowVideoRecorder(true)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all" title="Record Video">
                            <Camera size={18} />
                        </button>
                        <button onClick={toggleRecording} className={`p-2 rounded-lg transition-all ${isRecording ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`} title="Voice Dictation">
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                    <button
                        onClick={() => onToggleFavorite(note)}
                        className={`p-2 rounded-lg transition-all ${note.isFavorite ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title="Favorite"
                    >
                        <Star size={18} fill={note.isFavorite ? "currentColor" : "none"} />
                    </button>

                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all ${isPreview ? 'bg-blue-50 text-blue-600' : ''}`}
                        title={isPreview ? "Edit" : "Preview"}
                    >
                        {isPreview ? <Edit3 size={18} /> : <Eye size={18} />}
                    </button>

                    {note.isTrashed && (
                        <button
                            onClick={() => onSave({ ...note, isTrashed: false })}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Restore"
                        >
                            <RotateCcw size={18} />
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(note._id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title={note.isTrashed ? "Delete Permanently" : "Move to Trash"}
                    >
                        <Trash2 size={18} />
                    </button>

                    {/* Show save button always or keep it hidden if auto-save is enough - but let's make it visible on mobile to be sure */}
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        className={`ml-2 px-3 md:px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-all ${isDirty && !isSaving
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                        <span className="hidden sm:inline">Save</span>
                    </button>
                </div>
            </div>

            {/* Tags Input */}
            <div className="px-4 md:px-8 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-3 flex-shrink-0">Tags</span>
                <input
                    type="text"
                    value={tags}
                    onChange={(e) => {
                        setTags(e.target.value);
                        setIsDirty(true);
                    }}
                    placeholder="add tags..."
                    className="flex-1 bg-transparent border-none text-xs text-gray-600 focus:outline-none placeholder-gray-300 min-w-[200px]"
                />
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-4xl mx-auto min-h-full flex flex-col">
                    {isPreview ? (
                        <div className="px-4 md:px-12 py-8 md:py-12 prose prose-slate max-w-none">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Type your thoughts here..."
                            className="flex-1 w-full p-4 md:p-12 resize-none focus:outline-none text-gray-800 leading-relaxed text-base md:text-lg placeholder-gray-200"
                        />
                    )}
                </div>
            </div>

            {showVideoRecorder && (
                <VideoRecorder onRecordingComplete={handleVideoFile} onClose={() => setShowVideoRecorder(false)} />
            )}
        </div>
    );
};

export default NoteEditor;
