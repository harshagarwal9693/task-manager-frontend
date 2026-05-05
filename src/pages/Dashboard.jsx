
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Form States
  const [newTask, setNewTask] = useState({ title: '', project: '', assignee: '' });
  const [newProject, setNewProject] = useState({ title: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate('/');
    
    // Fetch Tasks
    axios.get('https://task-manager-backend-production-38f6.up.railway.app/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setTasks(res.data));

    // If Admin, fetch Projects and Users for the creation forms
 if (user?.role?.toUpperCase() === 'ADMIN') {
      axios.get('https://task-manager-backend-production-38f6.up.railway.app/api/projects', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setProjects(res.data))
        .catch(err => console.error("Error fetching projects:", err));
        
      axios.get('https://task-manager-backend-production-38f6.up.railway.app/api/users', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUsers(res.data))
        .catch(err => console.error("Error fetching users:", err));
    }
    setLoading(false);
  }, [token, user, navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://task-manager-backend-production-38f6.up.railway.app/api/projects', newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects([...projects, res.data]);
      setNewProject({ title: '' });
      alert("Project created!");
    } catch (err) { console.error(err); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://task-manager-backend-production-38f6.up.railway.app/api/tasks', newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the page to show the new task with populated user/project names
      window.location.reload(); 
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`https://task-manager-backend-production-38f6.up.railway.app/api/tasks/${taskId}/status`, 
        { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Team Dashboard</h1>
          <p className="text-gray-500 mt-1">Logged in as <span className="font-semibold">{user?.name}</span> ({user?.role})</p>
        </div>
        <button onClick={logout} className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-semibold">Logout</button>
      </div>

      {/* ADMIN CONTROLS (Only visible to Admins) */}
      {user?.role?.toUpperCase() === 'ADMIN' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create Project Form */}
          <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">1. Create a Project</h2>
            <input 
              type="text" placeholder="Project Name" required value={newProject.title}
              onChange={e => setNewProject({title: e.target.value})}
              className="w-full p-2 border rounded mb-4"
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Create Project</button>
          </form>

          {/* Create Task Form */}
          <form onSubmit={handleCreateTask} className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">2. Assign a Task</h2>
            <input 
              type="text" placeholder="Task Title" required value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              className="w-full p-2 border rounded mb-3"
            />
            <select required className="w-full p-2 border rounded mb-3 bg-white"
              onChange={e => setNewTask({...newTask, project: e.target.value})}>
              <option value="">Select Project...</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
            <select required className="w-full p-2 border rounded mb-4 bg-white"
              onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
              <option value="">Assign to Member...</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
            </select>
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Assign Task</button>
          </form>
        </div>
      )}

      {/* Kanban Board (Status Tracking) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
          <div key={status} className="bg-gray-200 p-4 rounded-xl">
            <h2 className="text-lg font-bold mb-4">{status.replace('_', ' ')}</h2>
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task._id} className="bg-white p-5 rounded-lg shadow-sm mb-4 border-l-4 border-blue-500">
                <h3 className="font-bold mb-1">{task.title}</h3>
                <p className="text-sm text-gray-500 mb-2">Project: {task.project?.title}</p>
                {user?.role?.toUpperCase() === 'ADMIN' && <p className="text-xs bg-gray-100 p-1 rounded inline-block mb-3">👤 {task.assignee?.name}</p>}
                
                <div className="flex gap-2 border-t pt-2 mt-2">
                  {status !== 'TODO' && <button onClick={() => updateStatus(task._id, 'TODO')} className="flex-1 text-xs bg-gray-100 py-2 rounded">⬅ Todo</button>}
                  {status !== 'IN_PROGRESS' && <button onClick={() => updateStatus(task._id, 'IN_PROGRESS')} className="flex-1 text-xs bg-yellow-100 py-2 rounded">Start ➡</button>}
                  {status !== 'DONE' && <button onClick={() => updateStatus(task._id, 'DONE')} className="flex-1 text-xs bg-green-100 py-2 rounded">Done ✔</button>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
