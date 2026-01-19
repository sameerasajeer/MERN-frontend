import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';

import { API_BASE } from './config';

function App() {
  const [notes, setNotes] = useState([]);
  const [view, setView] = useState('all'); // 'all', 'favorites'
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'editor'

  const fetchNotes = async () => {
    try {
      const endpoint = view === 'trash' ? `${API_BASE}/trash` : API_BASE;
      const res = await axios.get(endpoint);
      setNotes(res.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [view]);

  const handleSaveNote = async (noteData) => {
    try {
      let savedNote;
      if (noteData._id) {
        // Update existing
        const res = await axios.put(`${API_BASE}/${noteData._id}`, noteData);
        savedNote = res.data;
      } else {
        // Create new
        const res = await axios.post(API_BASE, noteData);
        savedNote = res.data;
      }

      // Update local notes list
      setNotes(prev => {
        const isNoteInCurrentView = (view === 'all' && !savedNote.isTrashed) ||
          (view === 'favorites' && savedNote.isFavorite && !savedNote.isTrashed) ||
          (view === 'trash' && savedNote.isTrashed);

        if (noteData._id) {
          if (!isNoteInCurrentView) {
            return prev.filter(n => n._id !== savedNote._id);
          }
          return prev.map(n => n._id === savedNote._id ? savedNote : n);
        } else {
          return isNoteInCurrentView ? [savedNote, ...prev] : prev;
        }
      });

      setSelectedNote(savedNote);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!id) {
      setSelectedNote(null);
      setMobileView('list');
      return;
    }

    const isTrashed = selectedNote?.isTrashed;
    const confirmMsg = isTrashed
      ? 'Are you sure you want to delete this note permanently?'
      : 'Are you sure you want to move this note to trash?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
      setSelectedNote(null);
      setMobileView('list');
    } catch (err) {
      console.error('Error deleting note:', err);
      fetchNotes();
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      const updatedNote = { ...note, isFavorite: !note.isFavorite };
      // Optimistic update
      setNotes(notes.map(n => n._id === note._id ? updatedNote : n));
      if (selectedNote && selectedNote._id === note._id) {
        setSelectedNote(updatedNote);
      }

      await axios.put(`${API_BASE}/${note._id}`, updatedNote);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      fetchNotes(); // Revert on error
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      fetchNotes();
      return;
    }

    // Use the search endpoint
    try {
      const res = await axios.post(`${API_BASE}/search`, { query });
      setNotes(res.data);
    } catch (err) {
      console.error('Error searching notes:', err);
    }
  };

  const handleAddNote = () => {
    setSelectedNote({
      title: '',
      content: '',
      tags: [],
      isFavorite: false
    });
    setMobileView('editor');
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setMobileView('editor');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  // Filter notes based on view
  const filteredNotes = Array.isArray(notes) ? notes.filter(note => {
    if (view === 'favorites') return note.isFavorite && !note.isTrashed;
    if (view === 'trash') return note.isTrashed;
    return !note.isTrashed;
  }) : [];

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans relative">
      <Sidebar
        activeView={view}
        onSelectView={(v) => {
          setView(v);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className={`flex flex-1 w-full h-full overflow-hidden transition-transform duration-300 ease-in-out ${mobileView === 'editor' ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`} style={{ transform: mobileView === 'editor' && window.innerWidth < 768 ? 'translateX(-100%)' : undefined }}>
        <div className="flex-shrink-0 w-full md:w-80 md:flex-shrink-0 border-r border-gray-200">
          <NoteList
            notes={filteredNotes}
            selectedNoteId={selectedNote?._id}
            onSelectNote={handleSelectNote}
            onAddNote={handleAddNote}
            onSearch={handleSearch}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
        </div>
        <div className="flex-shrink-0 w-full md:flex-1 bg-white">
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
            onToggleFavorite={handleToggleFavorite}
            onBack={handleBackToList}
            isMobileView={mobileView === 'editor'}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
