// src/components/course/NotesPanel.jsx - Enhanced Version with Saved Notes
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { toast } from 'react-hot-toast';

const NotesPanel = ({ courseId, isOpen, onToggle, onNotesChange }) => {
  const [currentNote, setCurrentNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [panelWidth, setPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedNote, setExpandedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  
  const textareaRef = useRef(null);
  const panelRef = useRef(null);

  // Load notes when panel opens
  useEffect(() => {
    if (courseId && isOpen && !loading) {
      loadNotes();
    }
  }, [courseId, isOpen]);

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (panelRef.current && 
          !panelRef.current.contains(event.target) && 
          !event.target.closest('button[data-notes-trigger]') &&
          !event.target.closest('.notes-trigger')) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  // Load existing notes
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📝 Loading notes for course:', courseId);
      console.log('📝 API request URL:', `/api/notes/${courseId}`);
      
      const response = await API.get(`/notes/${courseId}`);
      console.log('📝 API response:', response);
      if (response.data.success) {
        const content = response.data.notes.content || '';
        
        // Parse content to extract saved notes
        if (content) {
          try {
            const parsedNotes = JSON.parse(content);
            if (Array.isArray(parsedNotes)) {
              setSavedNotes(parsedNotes);
            } else {
              // Legacy format - convert old notes to new format
              setSavedNotes([{
                id: Date.now(),
                title: 'Legacy Note',
                content: content,
                createdAt: new Date().toISOString(),
                preview: content.substring(0, 100)
              }]);
            }
          } catch {
            // If not JSON, treat as legacy single note
            setSavedNotes([{
              id: Date.now(),
              title: 'Legacy Note',
              content: content,
              createdAt: new Date().toISOString(),
              preview: content.substring(0, 100)
            }]);
          }
        } else {
          setSavedNotes([]);
        }
        
        setLastSaved(response.data.notes.updatedAt ? new Date(response.data.notes.updatedAt) : null);
        
        if (onNotesChange) {
          onNotesChange(content.length > 0);
        }
        
        console.log('📝 Notes loaded successfully');
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to load notes:', error);
        toast.error('Failed to load notes');
      } else {
        console.log('📝 No existing notes found');
        setSavedNotes([]);
      }
      
      if (onNotesChange) {
        onNotesChange(false);
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, onNotesChange]);

  // Save notes to backend
  const saveNotesToBackend = useCallback(async (notesArray) => {
    try {
      setSaving(true);
      const content = JSON.stringify(notesArray);
      console.log('📝 Saving notes to backend');
      console.log('📝 Course ID:', courseId);
      console.log('📝 Content length:', content.length);
      console.log('📝 API request URL:', `/notes/${courseId}`);
      
      const response = await API.post(`/notes/${courseId}`, {
        content: content
      });
      
      console.log('📝 Save response:', response);
      if (response.data.success) {
        setLastSaved(new Date());
        
        if (onNotesChange) {
          onNotesChange(notesArray.length > 0);
        }
        
        console.log('📝 Notes saved successfully');
        return true;
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes');
      return false;
    } finally {
      setSaving(false);
    }
  }, [courseId, onNotesChange]);

  // Save current note
  const saveCurrentNote = async () => {
    const noteContent = currentNote.trim();
    
    if (!noteContent) {
      toast.error('Please write something to save');
      return;
    }

    // Generate title from first line or first 50 characters
    const lines = noteContent.split('\n');
    const title = lines[0].trim().substring(0, 50) || 'Untitled Note';
    const preview = noteContent.substring(0, 150);

    const newNote = {
      id: Date.now(),
      title: title,
      content: noteContent,
      createdAt: new Date().toISOString(),
      preview: preview + (noteContent.length > 150 ? '...' : '')
    };

    const updatedNotes = [newNote, ...savedNotes];
    setSavedNotes(updatedNotes);
    
    const success = await saveNotesToBackend(updatedNotes);
    
    if (success) {
      setCurrentNote('');
      toast.success('📝 Note saved successfully!', {
        duration: 2000,
        style: { background: '#10B981', color: 'white' }
      });
      
      // Focus back to textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  // Toggle note expansion
  const toggleNoteExpansion = (noteId) => {
    setExpandedNote(expandedNote === noteId ? null : noteId);
    setEditingNote(null); // Close any editing when expanding
  };

  // Start editing a note
  const startEditingNote = (note) => {
    setEditingNote(note.id);
    setExpandedNote(note.id);
  };

  // Save edited note
  const saveEditedNote = async (noteId, newContent) => {
    if (!newContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    const lines = newContent.split('\n');
    const title = lines[0].trim().substring(0, 50) || 'Untitled Note';
    const preview = newContent.substring(0, 150) + (newContent.length > 150 ? '...' : '');

    const updatedNotes = savedNotes.map(note => 
      note.id === noteId 
        ? { ...note, title, content: newContent, preview, updatedAt: new Date().toISOString() }
        : note
    );

    setSavedNotes(updatedNotes);
    setEditingNote(null);
    
    const success = await saveNotesToBackend(updatedNotes);
    if (success) {
      toast.success('📝 Note updated successfully!');
    }
  };

  // Delete a note
  const deleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = savedNotes.filter(note => note.id !== noteId);
      setSavedNotes(updatedNotes);
      setExpandedNote(null);
      setEditingNote(null);
      
      const success = await saveNotesToBackend(updatedNotes);
      if (success) {
        toast.success('🗑️ Note deleted successfully!');
      }
    }
  };

  // Clear all notes
  const clearAllNotes = async () => {
    if (window.confirm('Are you sure you want to clear all notes? This action cannot be undone.')) {
      setSavedNotes([]);
      setCurrentNote('');
      setExpandedNote(null);
      setEditingNote(null);
      
      const success = await saveNotesToBackend([]);
      if (success) {
        toast.success('🗑️ All notes cleared!');
        if (onNotesChange) {
          onNotesChange(false);
        }
      }
    }
  };

  // Export notes
  const exportNotes = () => {
    if (savedNotes.length === 0) {
      toast.error('No notes to export');
      return;
    }

    try {
      let exportContent = `Course Notes - ${new Date().toLocaleDateString()}\n`;
      exportContent += '='.repeat(50) + '\n\n';
      
      savedNotes.forEach((note, index) => {
        exportContent += `${index + 1}. ${note.title}\n`;
        exportContent += `Created: ${new Date(note.createdAt).toLocaleString()}\n`;
        if (note.updatedAt) {
          exportContent += `Updated: ${new Date(note.updatedAt).toLocaleString()}\n`;
        }
        exportContent += '-'.repeat(30) + '\n';
        exportContent += note.content + '\n\n';
      });

      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `course-notes-${courseId}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('📄 Notes exported successfully!');
    } catch (error) {
      console.error('Failed to export notes:', error);
      toast.error('Failed to export notes');
    }
  };

  // Resize functionality
  const startResize = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (e) => {
      const deltaX = startX - e.clientX;
      const newWidth = Math.max(300, Math.min(800, startWidth + deltaX));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelWidth]);

  // Word count for current note
  const currentWordCount = currentNote.trim().split(/\s+/).filter(word => word.length > 0).length;
  const currentCharCount = currentNote.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[9999] flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Mobile backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        {/* Resizable Notes Panel */}
        <motion.div 
          ref={panelRef}
          className="relative h-full bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-l border-white/20 shadow-2xl flex flex-col"
          style={{ 
            width: `${panelWidth}px`,
            maxWidth: '80vw',
            minWidth: '300px'
          }}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Resize Handle */}
          <div 
            className={`absolute left-0 top-0 w-2 h-full cursor-col-resize bg-purple-500/30 hover:bg-purple-500/60 transition-colors duration-200 hidden lg:block z-[1001] group ${isResizing ? 'bg-purple-500/80' : ''}`}
            onMouseDown={startResize}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-0.5 h-8 bg-white/40 group-hover:bg-white/70 transition-colors duration-200"></div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-lg">📝</span>
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">My Notes</h3>
                <p className="text-xs text-white/60">
                  {saving ? 'Saving...' : lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : 'Ready to write'}
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={onToggle}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-white text-lg">✕</span>
            </motion.button>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <motion.button
                onClick={saveCurrentNote}
                disabled={saving || !currentNote.trim()}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {saving ? (
                  <>
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Note</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={exportNotes}
                disabled={savedNotes.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 text-xs font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>📄</span>
                <span>Export</span>
              </motion.button>

              <motion.button
                onClick={clearAllNotes}
                disabled={savedNotes.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 text-xs font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>🗑️</span>
                <span>Clear All</span>
              </motion.button>
            </div>

            <div className="text-xs text-white/60">
              {savedNotes.length} saved notes
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/70">Loading your notes...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Current Note Input */}
                <div className="p-4 border-b border-white/10 bg-white/5 flex-shrink-0">
                  <div className="mb-2">
                    <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                      <span>✍️</span>
                      Write New Note
                    </h4>
                    <p className="text-xs text-white/50 mt-1">
                      Write your note and click "Save Note" to add it to your collection
                    </p>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Write your note here...

Examples:
• Key concept from the lecture
• Important formula or definition  
• Question to ask later
• Summary of the chapter

First line will become the title!"
                    className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-white/40 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      lineHeight: '1.5'
                    }}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-white/50">
                    <div className="flex items-center gap-4">
                      <span>Words: {currentWordCount}</span>
                      <span>Characters: {currentCharCount}</span>
                    </div>
                    {currentNote.trim() && (
                      <span className="text-green-400">Ready to save ✓</span>
                    )}
                  </div>
                </div>

                {/* Saved Notes List */}
                <div className="flex-1 overflow-y-auto">
                  {savedNotes.length === 0 ? (
                    <div className="flex items-center justify-center h-full p-8">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-white font-semibold mb-2">No Notes Yet</h3>
                        <p className="text-white/60 text-sm">
                          Write your first note above and click "Save Note" to get started!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      <h4 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
                        <span>📚</span>
                        Saved Notes ({savedNotes.length})
                      </h4>
                      
                      {savedNotes.map((note, index) => (
                        <motion.div
                          key={note.id}
                          className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {/* Note Header */}
                          <div 
                            className="cursor-pointer"
                            onClick={() => toggleNoteExpansion(note.id)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h5 className="text-white font-medium text-sm truncate">
                                  {note.title}
                                </h5>
                                <p className="text-white/60 text-xs mt-1">
                                  {new Date(note.createdAt).toLocaleString()}
                                  {note.updatedAt && note.updatedAt !== note.createdAt && (
                                    <span className="ml-2 text-yellow-400">
                                      (Updated: {new Date(note.updatedAt).toLocaleString()})
                                    </span>
                                  )}
                                </p>
                                {expandedNote !== note.id && (
                                  <p className="text-white/70 text-sm mt-2 line-clamp-2">
                                    {note.preview}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <motion.button
                                  className="text-white/60 hover:text-white transition-colors duration-200"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <span className="text-sm">
                                    {expandedNote === note.id ? '🔽' : '▶️'}
                                  </span>
                                </motion.button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Note Content */}
                          <AnimatePresence>
                            {expandedNote === note.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-white/20">
                                  {editingNote === note.id ? (
                                    <EditNoteForm
                                      note={note}
                                      onSave={(content) => saveEditedNote(note.id, content)}
                                      onCancel={() => setEditingNote(null)}
                                    />
                                  ) : (
                                    <>
                                      <div className="bg-white/5 rounded-lg p-3 mb-4">
                                        <pre className="text-white text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                          {note.content}
                                        </pre>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <motion.button
                                          onClick={() => startEditingNote(note)}
                                          className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200 text-xs"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <span>✏️</span>
                                          Edit
                                        </motion.button>
                                        
                                        <motion.button
                                          onClick={() => deleteNote(note.id)}
                                          className="flex items-center gap-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 text-xs"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <span>🗑️</span>
                                          Delete
                                        </motion.button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Stats */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-4">
                <span>Total Notes: {savedNotes.length}</span>
                <span>Writing: {currentWordCount} words</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  saving ? 'bg-yellow-400 animate-pulse' : 
                  lastSaved ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs">
                  {saving ? 'Saving' : lastSaved ? 'Saved' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Edit Note Form Component
const EditNoteForm = ({ note, onSave, onCancel }) => {
  const [editContent, setEditContent] = useState(note.content);
  
  const handleSave = () => {
    onSave(editContent);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="w-full h-40 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
        placeholder="Edit your note..."
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.5'
        }}
      />
      
      <div className="flex items-center gap-2">
        <motion.button
          onClick={handleSave}
          disabled={!editContent.trim()}
          className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 text-sm font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>💾</span>
          Save Changes
        </motion.button>
        
        <motion.button
          onClick={onCancel}
          className="flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 text-sm font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>❌</span>
          Cancel
        </motion.button>
      </div>
    </div>
  );
};

export default NotesPanel;