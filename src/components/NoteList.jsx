import React, { useState } from 'react';
import { Plus, Search, Menu, Star } from 'lucide-react';

const NoteList = ({ notes, selectedNoteId, onSelectNote, onAddNote, onSearch, onMenuClick }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch(term);
    };

    return (
        <div className="flex-1 bg-white flex flex-col h-full border-r border-gray-200">
            <div className="p-4 border-b border-gray-200 space-y-4">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onMenuClick}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
                        title="Open Sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        />
                    </div>
                </div>
                <button
                    onClick={onAddNote}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 font-medium text-sm shadow-md shadow-blue-500/20 active:scale-[0.98]"
                >
                    <Plus size={18} />
                    <span>New Note</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {notes.length === 0 ? (
                    <div className="mt-20 px-8 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-300" size={24} />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">No notes found</h3>
                        <p className="text-gray-500 text-sm">Try searching for something else or create a new note.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notes.map((note) => (
                            <div
                                key={note._id}
                                onClick={() => onSelectNote(note)}
                                className={`p-5 cursor-pointer hover:bg-gray-50 transition-all duration-200 group ${selectedNoteId === note._id ? 'bg-blue-50 ring-1 ring-inset ring-blue-100' : ''}`}
                            >
                                <div className="flex items-start justify-between mb-1 gap-2">
                                    <h3 className={`font-semibold text-sm truncate flex-1 ${selectedNoteId === note._id ? 'text-blue-900' : 'text-gray-900'}`}>
                                        {note.title || 'Untitled Note'}
                                    </h3>
                                    {note.isFavorite && <Star size={14} className="text-yellow-500 fill-current flex-shrink-0 mt-0.5" />}
                                </div>
                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3">
                                    {note.content || 'No content yet...'}
                                </p>
                                <div className="flex items-center flex-wrap gap-1.5">
                                    {note.tags && note.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-200">
                                            {tag}
                                        </span>
                                    ))}
                                    {note.tags && note.tags.length > 3 && (
                                        <span className="text-[10px] text-gray-400">+{note.tags.length - 3}</span>
                                    )}
                                    <span className="text-[10px] text-gray-400 ml-auto font-medium">
                                        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteList;
