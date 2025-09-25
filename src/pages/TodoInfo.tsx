import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosApiInstance from "../api/api";
import { type Todo } from "./AddTodo";
const LOCAL_STORAGE_KEY = "myTodosApp";

export const getTodosFromLocalStorage = () => {
  try {
    const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
    const convertedTodo = storedTodos ? JSON.parse(storedTodos) : [];
    return convertedTodo as Todo[];
  } catch (error) {
    console.error("Error reading from Local Storage:", error);
    return [];
  }
};

const TodoInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        try {
          const response = await axiosApiInstance.get(`/todos/${todoId}`);
          console.log(`TodoInfo: Found todo ID ${todoId} in Local Storage.`);

          return { ...localTodo, userId: response.data.userId || null };
        } catch (apiError) {
          console.error(
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
    enabled: !!todoId,
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
          <p>Error: {error.message}</p>
          <p>The todo with ID "{id}" could not be found or loaded.</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => navigate("/")}
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
            onClick={() => navigate("/")}
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
      className="card w-80 bg-base-100 shadow-xl mx-auto mt-10 md:w-96"
      aria-labelledby="todo-details-heading"
    >
      <div className="card-body">
        <h1
          id="todo-details-heading"
          className="card-title text-2xl font-bold mb-4"
        >
          Todo Details
        </h1>

        <div className="mb-3">
          <h2 className="text-lg font-semibold" id="title-label">
            Title:
          </h2>
          <p className="text-gray-300" aria-labelledby="title-label">
            {todo.title}
          </p>
        </div>

        <div className="mb-3">
          <h2 className="text-lg font-semibold" id="description-label">
            Description:
          </h2>
          <p className="text-gray-300" aria-labelledby="description-label">
            {todo.description || "No description provided."}
          </p>
        </div>

        <div className="mb-3">
          <h2 className="text-lg font-semibold" id="status-label">
            Status:
          </h2>
          <p
            className={`font-bold ${statusColor}`}
            aria-labelledby="status-label"
          >
            {statusText}
          </p>
        </div>

        <div className="mb-3">
          <h2 className="text-lg font-semibold" id="userid-label">
            Assigned User ID:
          </h2>
          <p className="text-gray-300" aria-labelledby="userid-label">
            {todo.userId || "N/A"}
          </p>
        </div>

        <div className="card-actions justify-end mt-6">
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Back to List
          </button>
        </div>
      </div>
    </main>
  );
};

export default TodoInfo;
