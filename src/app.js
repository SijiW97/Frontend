import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import axios from "axios";
import cardImage from "./assets/card.jpg";

const API_URL = "https://backend-gzk7.onrender.com/api/todos";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [emailContent, setEmailContent] = useState("");

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

  const addTodo = async (e) => {
    e.preventDefault();
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
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      const updatedTodo = await response.json();

      // Remove the todo from its current position
      const filteredTodos = todos.filter(todo => todo._id !== id);

      // If marking as complete, add to end; if marking incomplete, add to beginning
      const newTodos = updatedTodo.completed
        ? [...filteredTodos, updatedTodo]  // Completed goes to end
        : [updatedTodo, ...filteredTodos]; // Incomplete goes to beginning

      setTodos(newTodos);
      showToast(completed ? 'Todo marked as active' : 'Todo completed!');
    } catch (error) {
      console.error("Error updating todo:", error);
      showToast('Failed to update todo', 'error');
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

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const response = await axios.put(`${API_URL}/${id}`, { title: editText });
      setTodos(todos.map(t => (t._id === id ? response.data : t)));
      setEditingId(null);
      setEditText('');
      showToast('Todo updated!');
    } catch (error) {
      console.error("Error updating todo:", error);
    }
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

  // Open the modal and prepare the todo list content for sharing
  const openModal = () => {
    if (todos.length === 0) {
      showToast("No todos to share!", "error");
      return;
    }
    const content = todos
      .map((todo, index) => `${index + 1}. ${todo.title} ${todo.completed ? "✅" : "⬜"}`)
      .join("\n");
    setEmailContent(content);
    setModalVisible(true);
  };

  // Close the modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Open default email client with todos in body
  const shareViaEmailClient = () => {
    const subject = encodeURIComponent("My Todo List");
    const body = encodeURIComponent(emailContent);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    showToast("Opening email client...");
  };

  // Copy todo list to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailContent);
      showToast("Todo list copied to clipboard!");
      alert(`Todo List Preview Copied to Clipboard:\n\n${emailContent}`);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  // Preview the todo list content in a modal or alert
  const showEmailPreview = () => {
    alert(`Todo List Preview:\n\n${emailContent}`);
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="rounded-3xl p-8 w-full max-w-md shadow-2xl backdrop-blur-md"
        style={{
          backgroundImage: `url(${cardImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "rgba(0,0,0,0.3)",
          backgroundBlendMode: "overlay",
        }}>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            My Todo List
          </h1>
          <p className="text-white/90 text-sm mt-1 drop-shadow">
            Stay organized, stay productive
          </p>
        </div>

        {/* Input */}
        <form onSubmit={addTodo} className="flex items-center mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-xl px-4 py-2 text-gray-900 bg-white/90 focus:outline-none focus:ring-4 focus:ring-pink-300/50 shadow-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="ml-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white font-semibold px-5 py-2 rounded-xl transition-transform transform hover:scale-105 shadow-lg"
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
              className={`flex-1 py-2 font-medium capitalize rounded-lg transition 
  ${filter === f
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md scale-105"
                  : "bg-white/70 text-gray-800 hover:bg-white/80"
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
                className={`flex items-center justify-between bg-white/20 rounded-xl p-3 transition hover:bg-white/30 hover:scale-[1.02] backdrop-blur-md ${todo.completed ? "opacity-60" : ""
                  }`}
              >

                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => toggleComplete(todo._id, todo.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition 
    ${todo.completed
                        ? "bg-gradient-to-r from-purple-400 to-pink-400 border-transparent shadow-md"
                        : "border-white/70 hover:border-white"
                      }`}
                  >
                    {todo.completed && <Check size={16} className="text-white" />}
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
                      className={`text-white font-medium flex-1 ${todo.completed ? 'line-through' : ''
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
          <div className="flex justify-center">
            <button onClick={openModal} disabled={todos.length === 0} className={`px-4 py-2 rounded-lg text-white font-semibold transition 
      ${todos.length === 0
                ? "bg-gray-400 cursor-not-allowed" // disabled style
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              }`}>
              Share the To Do List
            </button>
          </div>
          {/* Modal */}
          {modalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-lg font-bold">Share Todo List</h2>
                <button onClick={shareViaEmailClient} className="w-full mt-4 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                  📧 Open Email Client
                </button>
                <button onClick={copyToClipboard} className="w-full mt-2 p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
                  📋 Copy to Clipboard
                </button>
                <button onClick={showEmailPreview} className="w-full mt-2 p-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg">
                  👁️ Preview Content
                </button>
                <button onClick={closeModal} className="w-full mt-4 p-2 bg-gray-200 rounded-lg text-black">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
