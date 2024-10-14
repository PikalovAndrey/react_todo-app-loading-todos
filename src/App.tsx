/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import { deleteTodos, getTodos } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';
import { FilterOptions } from './FilterOptions';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterOptions>(FilterOptions.ALL);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const loadedTodos = await getTodos();

        setTodos(loadedTodos);
      } catch (error) {
        setErrorMessage('Unable to load todos');
      }
    };

    loadTodos();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleTodoDelete = (todoId: number) => {
    deleteTodos(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      });
  };

  const handleCompletedTodosDeleted = () => {
    setTodos(currentTodos => currentTodos.filter(todo => !todo.completed));
  };

  const handleTodosToggle = () => {
    const hasIncompleteTodos = todos.some(todo => !todo.completed);

    setTodos(currentTodos =>
      currentTodos.map(todo => ({
        ...todo,
        completed: hasIncompleteTodos,
      })),
    );
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case FilterOptions.ACTIVE:
        return !todo.completed;
      case FilterOptions.COMPLETED:
        return todo.completed;
      default:
        return true;
    }
  });

  const completedTodos = todos.filter(todo => todo.completed);

  const handleFilterChange = (newFilter: FilterOptions) => {
    setFilter(newFilter);
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {todos.length > 0 && (
            <button
              type="button"
              className={classNames('todoapp__toggle-all', {
                active: completedTodos.length === todos.length,
              })}
              data-cy="ToggleAllButton"
              onClick={handleTodosToggle}
            />
          )}

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              autoFocus
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {filteredTodos.map(todo => {
            return (
              <div
                data-cy="Todo"
                className={classNames('todo', { completed: todo.completed })}
                key={todo.id}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>

                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                  onClick={() => handleTodoDelete(todo.id)}
                >
                  ×
                </button>

                {/* overlay will cover the todo while it is being deleted or updated */}
                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            );
          })}
        </section>

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.length - completedTodos.length} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: filter === FilterOptions.ALL,
                })}
                data-cy="FilterLinkAll"
                onClick={() => handleFilterChange(FilterOptions.ALL)}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: filter === FilterOptions.ACTIVE,
                })}
                data-cy="FilterLinkActive"
                onClick={() => handleFilterChange(FilterOptions.ACTIVE)}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: filter === FilterOptions.COMPLETED,
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => handleFilterChange(FilterOptions.COMPLETED)}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            {todos.some(todo => todo.completed) && (
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                onClick={handleCompletedTodosDeleted}
              >
                Clear completed
              </button>
            )}
          </footer>
        )}
      </div>
      {/* Add the 'hidden' class to hide the message smoothly */}

      <div
        data-cy="ErrorNotification"
        className={classNames('notification', { hidden: !errorMessage })}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
};
