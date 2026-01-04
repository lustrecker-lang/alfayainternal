'use client';

import { ArrowLeft, Save, Trash2, CheckSquare, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject, updateProject, deleteProject } from '@/lib/project';
import { formatCurrency } from '@/lib/finance';
import type { Project, ProjectTask, ProjectMilestone } from '@/types/project';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ProjectEditor() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [project, setProject] = useState<Project | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Editable Fields
    const [name, setName] = useState('');
    const [status, setStatus] = useState<Project['status']>('ACTIVE');
    const [priority, setPriority] = useState<Project['priority']>('MEDIUM');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState(0);

    // Tasks & Milestones
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);

    useEffect(() => {
        if (params.id) {
            loadProject(params.id as string);
        }
    }, [params.id]);

    const loadProject = async (id: string) => {
        try {
            const data = await getProject(id);
            if (data) {
                setProject(data);
                setName(data.name);
                setStatus(data.status);
                setPriority(data.priority);
                if (data.start_date) setStartDate(new Date(data.start_date).toISOString().split('T')[0]);
                if (data.due_date) setDueDate(new Date(data.due_date).toISOString().split('T')[0]);
                setDescription(data.description || '');
                setBudget(data.budget || 0);
                setTasks(data.tasks || []);
                setMilestones(data.milestones || []);
            }
        } catch (error) {
            console.error('Error loading project:', error);
            showToast.error('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!project) return;
        setSaving(true);
        try {
            await updateProject(project.id, {
                name,
                status,
                priority,
                start_date: startDate ? new Date(startDate) : undefined,
                due_date: dueDate ? new Date(dueDate) : undefined,
                description,
                budget,
                tasks,
                milestones
            });
            showToast.success('Project updated successfully');
        } catch (error) {
            console.error('Error updating project:', error);
            showToast.error('Failed to update project');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!project) return;
        try {
            await deleteProject(project.id);
            showToast.success('Project deleted successfully');
            router.push('/dashboard/afconsult/projects');
        } catch (error) {
            console.error('Error deleting project:', error);
            showToast.error('Failed to delete project');
        }
    };

    const toggleTask = (taskId: string) => {
        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
        ));
    };

    const addTask = () => {
        const newTask: ProjectTask = {
            id: crypto.randomUUID(),
            title: 'New Task',
            is_completed: false
        };
        setTasks([...tasks, newTask]);
    };

    const updateTaskTitle = (taskId: string, title: string) => {
        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, title } : t
        ));
    };

    const removeTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!project) return <div className="p-8">Project not found</div>;

    const progress = tasks.length > 0
        ? Math.round((tasks.filter(t => t.is_completed).length / tasks.length) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/projects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {name}
                            <span className={`text-sm px-2 py-0.5 rounded border font-medium
                                ${status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                                    status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        'bg-gray-100 text-gray-700 border-gray-200'}
                            `}>
                                {status}
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Client: {project.clientName || 'Unknown'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Project"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white rounded hover:bg-afconsult/90 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                <select
                                    value={priority}
                                    onChange={e => setPriority(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget (AED)</label>
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={e => setBudget(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                            <button
                                onClick={addTask}
                                className="flex items-center gap-1 text-sm text-afconsult hover:bg-afconsult/10 px-2 py-1 rounded transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Task
                            </button>
                        </div>

                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={`w-5 h-5 border rounded flex items-center justify-center transition-colors
                                            ${task.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-gray-400'}
                                        `}
                                    >
                                        {task.is_completed && <CheckSquare className="w-3 h-3" />}
                                    </button>
                                    <input
                                        type="text"
                                        value={task.title}
                                        onChange={e => updateTaskTitle(task.id, e.target.value)}
                                        className={`flex-1 bg-transparent border-none outline-none text-sm
                                            ${task.is_completed ? 'text-gray-400 line-through' : 'text-gray-700'}
                                        `}
                                        placeholder="Task description..."
                                    />
                                    <button
                                        onClick={() => removeTask(task.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <p className="text-gray-400 text-sm italic text-center py-4">No tasks added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Progress Card */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Overall Progress</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl font-bold text-afconsult">{progress}%</span>
                            <span className="text-sm text-gray-500">
                                {tasks.filter(t => t.is_completed).length} / {tasks.length} tasks
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-afconsult h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Timeline</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <span className="block text-xs text-gray-500">Starts</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {startDate ? new Date(startDate).toLocaleDateString() : 'Set Date'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <span className="block text-xs text-gray-500">Due</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {dueDate ? new Date(dueDate).toLocaleDateString() : 'Set Date'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Project"
                message="Are you sure you want to delete this project? This cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
