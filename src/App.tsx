/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import { deleteTodos, getTodos } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';
import { FilterOptions } from './enums/FilterOptions';
import { ErrorMessages } from './enums/ErrorMessages';
import { filteredTodos } from './utils/filteringTodos';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TodoList } from './components/TodoList';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterOptions>(FilterOptions.ALL);
  const [errorMessage, setErrorMessage] = useState(ErrorMessages.NO_ERRORS);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const loadedTodos = await getTodos();

        setTodos(loadedTodos);
      } catch (error) {
        setErrorMessage(ErrorMessages.LOADING_ERROR);
      }
    };

    loadTodos();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(ErrorMessages.NO_ERRORS);
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
        setErrorMessage(ErrorMessages.DELETING_ERROR);
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

  const todosAfterFiltering = filteredTodos(todos, filter);

  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          completedTodos={completedTodos}
          onTodosToggle={handleTodosToggle}
        />

        <TodoList
          todosAfterFiltering={todosAfterFiltering}
          onTodoDelete={handleTodoDelete}
        />

        {todos.length > 0 && (
          <Footer
            todos={todos}
            completedTodos={completedTodos}
            filter={filter}
            setFilter={setFilter}
            onCompletedTodosDeleted={handleCompletedTodosDeleted}
          />
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames('notification', { hidden: !errorMessage })}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage(ErrorMessages.NO_ERRORS)}
        />
        {errorMessage}
      </div>
    </div>
  );
};
