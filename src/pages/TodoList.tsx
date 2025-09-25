import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosApiInstance from "../api/api";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import { CiCircleMore } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import { type Todo } from "./AddTodo";
import { AxiosError } from "axios";

// Local storage functions are now defined here
const LOCAL_STORAGE_KEY = "myTodosApp";

// Add the 'export' keyword to make the function available
export const getTodosFromLocalStorage = (): Todo[] => {
  try {
    const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedTodos ? (JSON.parse(storedTodos) as Todo[]) : [];
  } catch (error) {
    console.error("Error reading from Local Storage:", error);
    return [];
  }
};

// Add the 'export' keyword to make the function available
export const saveTodosToLocalStorage = (todos: Todo[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Error writing to Local Storage:", error);
  }
};

type TodoApi = {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
};

export type TodosResponse = {
  todos: TodoApi[];
};

const TodoList = () => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const todosPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus]);

  const { data: todos, isLoading, isError, error } = useQuery({
    queryKey: ["todos", currentPage, debouncedSearchTerm, filterStatus],
    queryFn: async () => {
      let currentTodos = getTodosFromLocalStorage();

      if (currentTodos.length === 0) {
        console.log("Local Storage empty, fetching initial data from DummyJSON...");
        try {
          const response = await axiosApiInstance.get<TodosResponse>("/todos?limit=20");
          currentTodos = response.data.todos.map((todo: TodoApi) => ({
            id: todo.id,
            title: todo.todo,
            completed: todo.completed,
            description: "No description from API",
            userId: todo.userId || null,
          }));
          saveTodosToLocalStorage(currentTodos);
        } catch (apiError) {
          console.error("Failed to fetch initial todos from DummyJSON:", apiError);
          currentTodos = [];
        }
      }

      let filteredAndSearchedTodos = currentTodos;
      if (debouncedSearchTerm) {
        const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
        filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
          (todo: Todo) => todo.title.toLowerCase().includes(lowercasedSearchTerm)
        );
      }
      if (filterStatus === "Completed") {
        filteredAndSearchedTodos = filteredAndSearchedTodos.filter((todo: Todo) => todo.completed);
      } else if (filterStatus === "Pending") {
        filteredAndSearchedTodos = filteredAndSearchedTodos.filter((todo: Todo) => !todo.completed);
      }
      const totalFilteredCount = filteredAndSearchedTodos.length;
      setTotalPages(Math.ceil(totalFilteredCount / todosPerPage) || 1);
      const startIndex = (currentPage - 1) * todosPerPage;
      const endIndex = startIndex + todosPerPage;
      const paginatedTodos = filteredAndSearchedTodos.slice(startIndex, endIndex);
      return paginatedTodos;
    },
    staleTime: Infinity,
    gcTime: 0,
  });

  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const currentTodos = getTodosFromLocalStorage();
      const updatedTodos = currentTodos.map((todo: Todo) =>
        todo.id === id ? { ...todo, completed: completed } : todo
      );
      saveTodosToLocalStorage(updatedTodos);
      queryClient.setQueryData(
        ["todos", currentPage, debouncedSearchTerm, filterStatus],
        (old: Todo[] | undefined) => old?.map((todo) => (todo.id === id ? { ...todo, completed: completed } : todo))
      );
      queryClient.setQueryData(
        ["todo", id.toString()],
        (oldTodo: Todo | undefined) => (oldTodo ? { ...oldTodo, completed } : undefined)
      );
      try {
        await axiosApiInstance.patch(`/todos/${id}`, { completed: completed });
        console.log(`[OPTIONAL API CALL] Sent PATCH for todo ID ${id} to DummyJSON. (This is non-persistent).`);
      } catch (apiError: unknown) {
        if (apiError instanceof AxiosError) {
          console.warn(`[OPTIONAL API CALL FAILED] DummyJSON PATCH for todo ID ${id} failed:`, apiError.message);
        } else if (apiError instanceof Error) {
          console.warn(`[OPTIONAL API CALL FAILED] DummyJSON PATCH for todo ID ${id} failed:`, apiError.message);
        } else {
          console.warn(`[OPTIONAL API CALL FAILED] DummyJSON PATCH for todo ID ${id} failed:`, apiError);
        }
      }
      return { id, completed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      console.log("Successfully toggled todo status (Local Storage) for ID:", data.id);
    },
    onError: (err, variables) => {
      console.error("Error toggling todo status for ID:", variables.id, err);
      alert(`Failed to update todo: ${err.message}. (Local Storage might still be updated, API failed).`);
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      const currentTodos = getTodosFromLocalStorage();
      const updatedTodos = currentTodos.filter((todo) => todo.id !== id);
      saveTodosToLocalStorage(updatedTodos);
      queryClient.setQueryData(
        ["todos", currentPage, debouncedSearchTerm, filterStatus],
        (old: Todo[] | undefined) => (old ? old.filter((todo) => todo.id !== id) : [])
      );
      queryClient.removeQueries({
        queryKey: ["todo", id.toString()],
      });
      try {
        await axiosApiInstance.delete(`/todos/${id}`);
        console.log(`[OPTIONAL API CALL] Sent DELETE for todo ID ${id} to DummyJSON. (This is non-persistent).`);
      } catch (apiError: unknown) {
        if (apiError instanceof AxiosError) {
          console.warn(`[OPTIONAL API CALL FAILED] DummyJSON PATCH for todo ID ${id} failed:`, apiError.message);
        } else if (apiError instanceof Error) {
          console.warn(`[OPTIONAL API CALL FAILED] DummyJSON PATCH for todo ID ${id} failed:`, apiError.message);
        } else {
          console.warn(`[OPTIONAL API CALL FAILED] DummyJSON PATCH for todo ID ${id} failed:`, apiError);
        }
      }
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      console.log("Successfully deleted todo from Local Storage ID:", deletedId);
    },
    onError: (err, deletedId) => {
      console.error("CRITICAL ERROR: Failed to delete todo from Local Storage for ID:", deletedId, err);
      alert(`A critical error occurred while deleting your todo locally: ${err.message}. Your todo might not have been deleted.`);
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleDeleteTodo = (id: number) => {
    if (window.confirm(`Are you sure?`)) {
      setDeletingId(id);
      deleteTodoMutation.mutate(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const handleToggleComplete = (id: number, currentStatus: boolean) => {
    toggleTodoMutation.mutate({ id, completed: !currentStatus });
  };

  const handleTodoClick = (id: number) => {
    navigate(`/todo/${id}`);
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="card w-96 bg-base-100 shadow-xl mx-auto mt-10" role="status" aria-live="polite">
        <div className="card-body text-center">
          <span className="loading loading-spinner loading-lg" aria-hidden="true"></span>
          <p>Loading todos...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card w-96 bg-base-100 shadow-xl mx-auto mt-10" role="alert" aria-live="assertive">
        <div className="card-body text-center text-error">
          <p>Error loading todos: {error.message}</p>
          <p>Please check your internet connection or console for more details.</p>
          <button className="btn btn-primary mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["todos"] })}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="card w-80 bg-base-100 shadow-xl mx-auto mt-10 md:w-96" aria-labelledby="todo-list-heading">
      <div className="card-body">
        <h1 id="todo-list-heading" className="card-title text-2xl font-bold mb-4">
          API ToDo List
        </h1>
        <div className="flex items-center space-x-2 mb-4" role="search">
          <label htmlFor="search-input" className="sr-only">
            Search notes
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Search note..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search todos"
          />
          <label htmlFor="filter-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="filter-status"
            className="select select-bordered w-32"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter todos by completion status"
          >
            <option value="ALL">ALL</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="mb-4 text-center">
          <button
            className="btn btn-accent btn-block"
            onClick={() => navigate("/add-todo")}
            aria-label="Add new todo"
          >
            <IoMdAdd style={{ fontSize: "23px" }} aria-hidden="true" /> Add New
            Todo
          </button>
        </div>
        <div aria-live="polite" aria-atomic="true">
          {todos && todos.length > 0 ? (
            <ul className="space-y-3" role="list">
              {todos.map((todo) => (
                <li key={todo.id} className="flex items-center space-x-3 bg-base-200 p-2 rounded-lg" role="listitem">
                  <input
                    id={`todo-checkbox-${todo.id}`}
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo.id, todo.completed)}
                    className="checkbox checkbox-primary"
                    aria-label={`Mark todo "${todo.title}" as ${
                      todo.completed ? "incomplete" : "complete"
                    }`}
                  />
                  <span
                    className={`flex-grow ${
                      todo.completed ? "line-through text-gray-500" : ""
                    }`}
                    id={`todo-title-${todo.id}`}
                  >
                    {todo.title}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm text-lg"
                    onClick={() => handleTodoClick(todo.id)}
                    aria-label={`View details for ${todo.title}`}
                    aria-describedby={`todo-title-${todo.id}`}
                    title={`View Details for ${todo.title}`}
                  >
                    <CiCircleMore aria-hidden="true" />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDeleteTodo(todo.id)}
                    disabled={deleteTodoMutation.isPending && deletingId === todo.id}
                    aria-label={`Delete todo: ${todo.title}`}
                    aria-describedby={`todo-title-${todo.id}`}
                  >
                    {deleteTodoMutation.isPending && deletingId === todo.id ? (
                      <span className="loading loading-spinner loading-xs" role="status" aria-label="Deleting todo"></span>
                    ) : (
                      <AiOutlineDelete aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No todos found for this page.</p>
          )}
        </div>
        {todos && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </main>
  );
};

export default TodoList;