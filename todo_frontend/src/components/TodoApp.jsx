import React, { useEffect, useState, useCallback } from 'react';
import '../styles/common.css';
import '../styles/todo.css';

/**
 * PUBLIC_INTERFACE
 * TodoApp
 * A React component that renders a Todo list UI extracted from Figma.
 * - Preserves the original visual design and interactivity.
 * - Uses localStorage to persist tasks across sessions under the key "todo_tasks".
 * - Allows toggling completion by clicking the checkbox or the task title.
 * - Provides a floating action button to add new tasks via a prompt.
 *
 * Accessibility:
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

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    } catch {
      // ignore write errors (e.g., disabled storage)
    }
  }, [tasks]);

  // PUBLIC_INTERFACE
  /** Toggles a task's completion state by id. */
  const toggleTask = useCallback((id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  // PUBLIC_INTERFACE
  /** Adds a new task using a prompt for the title. */
  const addTask = useCallback(() => {
    const title = prompt('New task title:')?.trim();
    if (!title) return;
    const id = `t_${Date.now()}`;
    setTasks((prev) => [...prev, { id, title, completed: false }]);
    // After render, scroll to newly added task
    requestAnimationFrame(() => {
      const list = document.getElementById('task-list');
      list?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;

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
                  className="task-title"
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
                  className="task-options"
                  aria-label="More options"
                  title="More options"
                >
                  <span className="dots">
                    <span />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button id="add-task" className="fab" aria-label="Add task" onClick={addTask}>
          <span className="fab-plus" aria-hidden="true">
            +
          </span>
        </button>
      </main>
    </div>
  );
}

export default TodoApp;
