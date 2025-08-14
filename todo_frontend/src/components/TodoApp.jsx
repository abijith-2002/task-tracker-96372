import React, { useEffect, useState, useCallback, useRef } from 'react';
import '../styles/common.css';
import '../styles/todo.css';

/**
 * PUBLIC_INTERFACE
 * TodoApp
 * A React component that renders a Todo list UI extracted from Figma.
 * - Preserves the original visual design and interactivity.
 * - Uses localStorage to persist tasks across sessions under the key "todo_tasks".
 * - Allows toggling completion by clicking the checkbox or the task title.
 * - Provides a floating action button to add new tasks via a dialog/modal.
 *
 * Accessibility:
 * - Uses role="dialog" and aria-modal for the add-task modal with proper labelling.
 * - Task checkbox uses role="checkbox" with aria-checked state.
 * - Actionable controls are focusable and keyboard navigable.
 *
 * Returns:
 *   JSX.Element - The Todo screen structure with header, task list, and FAB.
 */
function TodoApp() {
  // Initialize from localStorage or seed with defaults similar to the original script.
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem('todo_tasks');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      { id: 't1', title: 'Implement Figma design', completed: false },
      { id: 't2', title: 'Fix UI bugs', completed: false },
      { id: 't3', title: 'Test features', completed: false },
      { id: 't4', title: 'Add SVG icons', completed: true },
    ];
  });

  // State for add-task dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const inputRef = useRef(null);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    } catch {
      // ignore write errors (e.g., disabled storage)
    }
  }, [tasks]);

  // Focus input when dialog opens
  useEffect(() => {
    if (showAddDialog) {
      // Use rAF to ensure element is rendered
      const id = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [showAddDialog]);

  // PUBLIC_INTERFACE
  /** Toggles a task's completion state by id. */
  const toggleTask = useCallback((id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  // PUBLIC_INTERFACE
  /** Opens the add-task dialog. */
  const openAddDialog = useCallback(() => {
    setNewTaskTitle('');
    setShowAddDialog(true);
  }, []);

  // PUBLIC_INTERFACE
  /** Closes the add-task dialog and resets the input. */
  const closeAddDialog = useCallback(() => {
    setShowAddDialog(false);
    setNewTaskTitle('');
  }, []);

  // PUBLIC_INTERFACE
  /** Confirms and adds a new task if the title is non-empty. */
  const confirmAddTask = useCallback(() => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const id = `t_${Date.now()}`;
    setTasks((prev) => [...prev, { id, title, completed: false }]);
    closeAddDialog();

    // After render, scroll to newly added task
    requestAnimationFrame(() => {
      const list = document.getElementById('task-list');
      list?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, [newTaskTitle, closeAddDialog]);

  // PUBLIC_INTERFACE
  /** Deletes a task by id. */
  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;

  // Keyboard handling for input: Enter confirms, Escape cancels
  const onInputKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmAddTask();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeAddDialog();
      }
    },
    [confirmAddTask, closeAddDialog]
  );

  return (
    <div className="screen screen--todo" data-screen="todo">
      <header className="todo-header">
        <div className="container">
          <div>
            <h1 className="todo-title">Tasks</h1>
            <p id="todo-progress" className="todo-subtitle">
              {done} of {total} completed
            </p>
          </div>
        </div>
      </header>

      <main className="todo-main">
        <div className="container todo-content">
          <ul id="task-list" className="task-list" aria-label="Task list">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`task-item${task.completed ? ' completed' : ''}`}
                data-id={task.id}
              >
                <button
                  type="button"
                  className="task-checkbox"
                  role="checkbox"
                  aria-checked={task.completed}
                  aria-label="Toggle completion"
                  onClick={() => toggleTask(task.id)}
                />
                <span
                  className={`task-title${task.completed ? ' completed' : ''}`}
                  onClick={() => toggleTask(task.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTask(task.id);
                    }
                  }}
                >
                  {task.title}
                </span>
                <button
                  type="button"
                  className="task-delete"
                  aria-label="Delete task"
                  title="Delete task"
                  onClick={() => deleteTask(task.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button id="add-task" className="fab" aria-label="Add task" onClick={openAddDialog}>
          <span className="fab-plus" aria-hidden="true">
            +
          </span>
        </button>
      </main>

      {/* Add Task Dialog */}
      {showAddDialog && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={closeAddDialog}
          aria-hidden={false}
        >
          <div
            className="add-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-dialog-title"
            aria-describedby="add-dialog-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="add-dialog-title" className="add-dialog-title">
              Add new task
            </h2>
            <p id="add-dialog-desc" className="add-dialog-desc">
              Enter a task name and press Add to confirm.
            </p>
            <input
              ref={inputRef}
              type="text"
              className="add-dialog-input"
              placeholder="e.g. Write unit tests"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={onInputKeyDown}
              aria-label="Task name"
            />
            <div className="add-dialog-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeAddDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmAddTask}
                disabled={!newTaskTitle.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoApp;
