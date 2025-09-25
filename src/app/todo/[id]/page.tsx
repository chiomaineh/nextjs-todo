'use client'

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosApiInstance from "../../lib/api";

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  userId?: number | null;
}

const LOCAL_STORAGE_KEY = "myTodosApp";

const getTodosFromLocalStorage = (): Todo[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedTodos ? (JSON.parse(storedTodos) as Todo[]) : [];
  } catch (error) {
    console.error("Error reading from Local Storage:", error);
    return [];
  }
};

const TodoInfo = () => {
  const params = useParams();
  const router = useRouter();
  
  const id = params?.id as string;
  const todoId = Number(id);

  console.log("TodoInfo: Component Rendered - ID from URL params:", todoId);

  const {
    data: todo,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["todo", todoId.toString()],
    queryFn: async () => {
      console.log(
        `TodoInfo: QueryFn - Initiating fetch for todo ID: ${todoId}`
      );

      const allLocalTodos = getTodosFromLocalStorage();
      const localTodo = allLocalTodos.find((t) => t.id === todoId);

      if (localTodo) {
        console.log(`TodoInfo: Found todo ID ${todoId} in Local Storage.`);
        
        // For locally created todos (high ID numbers), don't try API call
        if (todoId > 1000) {
          console.log(`TodoInfo: Using local-only todo (ID ${todoId} appears to be locally created)`);
          return localTodo;
        }
        
        // For API todos, try to enrich with API data
        try {
          const response = await axiosApiInstance.get(`/todos/${todoId}`);
          return { ...localTodo, userId: response.data.userId || null };
        } catch (apiError) {
          console.warn(
            `TodoInfo: Failed to fetch todo ID ${todoId} from DummyJSON API. (Local todo will be used without API userId)`,
            apiError
          );
          return localTodo;
        }
      }

      console.log(
        `TodoInfo: Todo ID ${todoId} not found in Local Storage, attempting API fetch from DummyJSON.`
      );
      try {
        const response = await axiosApiInstance.get(`/todos/${todoId}`);

        const apiTodo = {
          id: response.data.id,
          title: response.data.todo,
          completed: response.data.completed,
          userId: response.data.userId,
          description: "No description from API",
        };
        console.log(`TodoInfo: Found todo ID ${todoId} from DummyJSON API.`);

        return apiTodo;
      } catch (apiError) {
        console.error(
          `TodoInfo: Failed to fetch todo ID ${todoId} from DummyJSON API.`,
          apiError
        );

        throw new Error(`Todo with ID ${todoId} not found or API error.`);
      }
    },
    staleTime: Infinity,
    gcTime: 0,
    enabled: !!todoId && !isNaN(todoId),
  });

  console.log("TodoInfo: Current todo data from cache/query:", todo);

  if (isLoading) {
    return (
      <div
        className="card w-80 bg-base-100 shadow-xl mx-auto mt-10 md:w-96"
        role="status"
        aria-live="polite"
      >
        <div className="card-body text-center">
          <span
            className="loading loading-spinner loading-lg"
            aria-hidden="true"
          ></span>
          <p>Loading todo details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error("TodoInfo: Error fetching todo:", error);
    return (
      <div
        className="card w-80 bg-base-100 shadow-xl mx-auto mt-10 md:w-96"
        role="alert"
        aria-live="assertive"
      >
        <div className="card-body text-center text-error">
          <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <p>The todo with ID "{id}" could not be found or loaded.</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => router.push("/")}
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!todo) {
    console.warn(
      "TodoInfo: Todo data is null or undefined after load/fetch for ID:",
      id
    );
    return (
      <div
        className="card w-80 bg-base-100 shadow-xl mx-auto mt-10 md:w-96"
        role="alert"
        aria-live="assertive"
      >
        <div className="card-body text-center">
          <h2 className="card-title text-2xl font-bold">Todo Not Found</h2>
          <p>The todo with ID "{id}" could not be found.</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => router.push("/")}
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const statusText = todo.completed ? "Completed" : "Pending";
  const statusColor = todo.completed ? "text-success" : "text-warning";
  console.log(
    `TodoInfo: Displaying status for ID ${todo.id}: ${statusText} (completed: ${todo.completed})`
  );

  return (
  <main
    className="card w-full max-w-2xl bg-base-100 shadow-xl mx-auto mt-10 todo-info-card"
    aria-labelledby="todo-details-heading"
  >
    <div className="card-body todo-info-body">
      <h1
        id="todo-details-heading"
        className="card-title text-2xl font-bold mb-6 todo-info-title"
      >
        Todo Details
      </h1>

      {/* Title */}
      <div className="mb-4 todo-info-section">
        <h2 className="text-lg font-semibold section-label" id="title-label">
          Title:
        </h2>
        <p
          className="text-gray-300 section-text"
          aria-labelledby="title-label"
        >
          {todo.title}
        </p>
      </div>

      {/* Description */}
      <div className="mb-4 todo-info-section">
        <h2 className="text-lg font-semibold section-label" id="description-label">
          Description:
        </h2>
        <p
          className="text-gray-300 section-text"
          aria-labelledby="description-label"
        >
          {todo.description || "No description provided."}
        </p>
      </div>

      {/* Status */}
      <div className="mb-4 todo-info-section">
        <h2 className="text-lg font-semibold section-label" id="status-label">
          Status:
        </h2>
        <p
          className={`font-bold ${statusColor} section-status`}
          aria-labelledby="status-label"
        >
          {statusText}
        </p>
      </div>

      {/* User ID */}
      <div className="mb-4 todo-info-section">
        <h2 className="text-lg font-semibold section-label" id="userid-label">
          Assigned User ID:
        </h2>
        <p
          className="text-gray-300 section-text"
          aria-labelledby="userid-label"
        >
          {todo.userId || "N/A"}
        </p>
      </div>

      {/* Back button */}
      <div className="card-actions justify-end mt-8">
        <button
          className="btn btn-primary back-btn"
          onClick={() => router.push("/")}
        >
          Back to List
        </button>
      </div>
    </div>
  </main>
);

};

export default TodoInfo;