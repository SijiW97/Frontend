import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);

 useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500);
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
     try {
      const response = await axios.post(API_URL, { title: newTodo });
      setTodos([response.data, ...todos]);
      setNewTodo("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

const toggleComplete = async (id, completed) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, { completed: !completed });
      setTodos(todos.map(todo => (todo._id === id ? response.data : todo)));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };


  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditText(todo.title);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTodos(todos.map(t => (t._id === id ? { ...t, title: editText } : t)));
    setEditingId(null);
    setEditText('');
    showToast('Todo updated!');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-orange-400 p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white flex justify-center items-center gap-2">
            📝 My Todo List
          </h1>
          <p className="text-white/80 text-sm mt-1">Stay organized, stay productive</p>
        </div>

        {/* Input */}
        <form onSubmit={addTodo} className="flex items-center mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-xl px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="ml-3 bg-white/30 hover:bg-white/50 text-white font-semibold px-5 py-2 rounded-xl transition"
          >
            <Plus size={18} />
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex justify-between mb-6 bg-white/20 rounded-xl p-2">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-white font-medium capitalize rounded-lg transition ${
                filter === f ? 'bg-white/30' : 'hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-white">{todos.length}</p>
            <p className="text-white/80 text-sm">Total</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-white">{todos.filter(t => !t.completed).length}</p>
            <p className="text-white/80 text-sm">Active</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-white">{todos.filter(t => t.completed).length}</p>
            <p className="text-white/80 text-sm">Completed</p>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <p className="text-white/80 text-center py-6">No todos yet — add one above!</p>
          ) : (
            filteredTodos.map(todo => (
              <div
                key={todo._id}
                className={`flex items-center justify-between bg-white/20 rounded-xl p-3 transition hover:bg-white/30 ${
                  todo.completed ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => toggleComplete(todo._id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                      todo.completed
                        ? 'bg-white border-white'
                        : 'border-white border-opacity-70 hover:border-opacity-100'
                    }`}
                  >
                    {todo.completed && <Check size={16} className="text-purple-600" />}
                  </button>

                  {editingId === todo._id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-3 py-1 rounded-lg bg-white/30 text-white border border-white/40 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-white font-medium flex-1 ${
                        todo.completed ? 'line-through' : ''
                      }`}
                    >
                      {todo.title}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  {editingId === todo._id ? (
                    <>
                      <button
                        onClick={() => saveEdit(todo._id)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(todo)}
                        className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo._id)}
                        className="p-2 bg-white/20 text-white rounded-lg hover:bg-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
