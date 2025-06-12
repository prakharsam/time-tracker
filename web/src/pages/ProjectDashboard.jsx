import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, MenuItem, Select, InputLabel, FormControl, CircularProgress, Snackbar, Alert, Card, CardContent, CardActions, Divider, Stack
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { apiFetch } from '../api';

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', assigned_employee_ids: [] });
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, projectId: null });

  // Task dialog state
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({ name: '', employee_email: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [deleteTaskDialog, setDeleteTaskDialog] = useState({ open: false, taskId: null });

  // Only show active employees in dropdowns
  const activeEmployees = employees.filter(e => e.is_active);

  // Fetch projects and employees
  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      apiFetch('/projects'),
      apiFetch('/employees'),
      apiFetch('/tasks')
    ]).then(([projects, employees, tasks]) => {
      // Attach tasks to projects
      const projectsWithTasks = projects.map(p => ({
        ...p,
        tasks: tasks.filter(t => t.project_id === p.id)
      }));
      setProjects(projectsWithTasks);
      setEmployees(employees);
      setLoading(false);
    }).catch(err => {
      setError(err.detail || 'Failed to load data');
      setSnackbar({ open: true, message: err.detail || 'Failed to load data', severity: 'error' });
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Project CRUD
  const handleOpenProjectDialog = (project = null) => {
    setEditingProject(project);
    setProjectForm(project ? {
      name: project.name,
      description: project.description,
      assigned_employee_ids: project.assigned_employees?.map(e => e.email) || []
    } : { name: '', description: '', assigned_employee_ids: [] });
    setOpenProjectDialog(true);
  };
  const handleCloseProjectDialog = () => {
    setOpenProjectDialog(false);
    setEditingProject(null);
  };
  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(f => ({ ...f, [name]: value }));
  };
  const handleProjectEmployeesChange = (e) => {
    setProjectForm(f => ({ ...f, assigned_employee_ids: e.target.value }));
  };
  const handleSaveProject = async () => {
    try {
      if (editingProject) {
        await apiFetch(`/projects/${editingProject.id}`, {
          method: 'PUT',
          body: projectForm
        });
        setSnackbar({ open: true, message: 'Project updated', severity: 'success' });
      } else {
        await apiFetch('/projects', {
          method: 'POST',
          body: projectForm
        });
        setSnackbar({ open: true, message: 'Project created', severity: 'success' });
      }
      setOpenProjectDialog(false);
      setEditingProject(null);
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.detail || 'Error saving project', severity: 'error' });
    }
  };
  const handleDeleteProject = (projectId) => {
    setDeleteDialog({ open: true, projectId });
  };
  const confirmDelete = async () => {
    try {
      await apiFetch(`/projects/${deleteDialog.projectId}`, { method: 'DELETE' });
      setSnackbar({ open: true, message: 'Project deleted', severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.detail || 'Error deleting project', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, projectId: null });
    }
  };

  // Task CRUD
  const handleOpenTaskDialog = (projectId, task = null) => {
    setCurrentProjectId(projectId);
    setEditingTask(task);
    setTaskForm(task ? { name: task.name, employee_email: task.employee_email } : { name: '', employee_email: '' });
    setOpenTaskDialog(true);
  };
  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setEditingTask(null);
    setCurrentProjectId(null);
  };
  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(f => ({ ...f, [name]: value }));
  };
  const handleSaveTask = async () => {
    try {
      if (editingTask) {
        await apiFetch(`/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: { ...taskForm, project_id: currentProjectId }
        });
        setSnackbar({ open: true, message: 'Task updated', severity: 'success' });
      } else {
        await apiFetch('/tasks', {
          method: 'POST',
          body: { ...taskForm, project_id: currentProjectId }
        });
        setSnackbar({ open: true, message: 'Task created', severity: 'success' });
      }
      setOpenTaskDialog(false);
      setEditingTask(null);
      setCurrentProjectId(null);
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.detail || 'Error saving task', severity: 'error' });
    }
  };
  const handleDeleteTask = (taskId) => {
    setDeleteTaskDialog({ open: true, taskId });
  };
  const confirmDeleteTask = async () => {
    try {
      await apiFetch(`/tasks/${deleteTaskDialog.taskId}`, { method: 'DELETE' });
      setSnackbar({ open: true, message: 'Task deleted', severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.detail || 'Error deleting task', severity: 'error' });
    } finally {
      setDeleteTaskDialog({ open: false, taskId: null });
    }
  };

  // In the task dialog, only show employees assigned to the current project
  const projectAssignedEmployees = currentProjectId
    ? (projects.find(p => p.id === currentProjectId)?.assigned_employees || [])
    : [];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Project & Task Management</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenProjectDialog()}>Add Project</Button>
      </Box>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <Stack spacing={3}>
          {projects.map(project => (
            <Card key={project.id} variant="outlined" sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{project.name}</Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>{project.description}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">Assigned Employees:</Typography>
                    <Box sx={{ mb: 1, mt: 0.5 }}>
                      {project.assigned_employees && project.assigned_employees.length > 0 ? (
                        project.assigned_employees.map(emp => (
                          <Chip key={emp.email} label={emp.name + ' (' + emp.email + ')'} size="small" sx={{ mr: 1, mb: 1 }} />
                        ))
                      ) : <Typography variant="body2" color="text.secondary">None</Typography>}
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">Tasks:</Typography>
                    {project.tasks && project.tasks.length > 0 ? (
                      <List dense>
                        {project.tasks.map(task => (
                          <ListItem key={task.id} sx={{ pl: 0 }}>
                            <ListItemText
                              primary={<Typography fontWeight={600}>{task.name}</Typography>}
                              secondary={(() => {
                                const emp = employees.find(e => e.email === task.employee_email);
                                return emp ? `Assigned to: ${emp.name} (${emp.email})` : `Assigned to: ${task.employee_email}`;
                              })()}
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" aria-label="edit" onClick={() => handleOpenTaskDialog(project.id, task)}><Edit /></IconButton>
                              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)}><Delete /></IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    ) : <Typography variant="body2" color="text.secondary">No tasks</Typography>}
                    <Button size="small" startIcon={<Add />} onClick={() => handleOpenTaskDialog(project.id)} sx={{ mt: 1 }}>
                      Add Task
                    </Button>
                  </Box>
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenProjectDialog(project)}><Edit /></IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteProject(project.id)}><Delete /></IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      {/* Project Dialog */}
      <Dialog open={openProjectDialog} onClose={handleCloseProjectDialog}>
        <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Project Name"
            name="name"
            fullWidth
            value={projectForm.name}
            onChange={handleProjectFormChange}
          />
          <TextField
            margin="normal"
            label="Description"
            name="description"
            fullWidth
            value={projectForm.description}
            onChange={handleProjectFormChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign Employees</InputLabel>
            <Select
              multiple
              value={projectForm.assigned_employee_ids}
              onChange={handleProjectEmployeesChange}
              renderValue={(selected) => selected.map(eid => {
                const emp = employees.find(e => e.email === eid);
                return emp ? emp.name : eid;
              }).join(', ')}
            >
              {activeEmployees.map(emp => (
                <MenuItem key={emp.email} value={emp.email}>{emp.name} ({emp.email})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProjectDialog}>Cancel</Button>
          <Button onClick={handleSaveProject} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog}>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Task Name"
            name="name"
            fullWidth
            value={taskForm.name}
            onChange={handleTaskFormChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign Employee</InputLabel>
            <Select
              name="employee_email"
              value={taskForm.employee_email}
              onChange={handleTaskFormChange}
              label="Assign Employee"
            >
              {projectAssignedEmployees.map(emp => (
                <MenuItem key={emp.email} value={emp.email}>{emp.name} ({emp.email})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Project Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, projectId: null })}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this project?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, projectId: null })}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Task Delete Dialog */}
      <Dialog open={deleteTaskDialog.open} onClose={() => setDeleteTaskDialog({ open: false, taskId: null })}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTaskDialog({ open: false, taskId: null })}>Cancel</Button>
          <Button onClick={confirmDeleteTask} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 