// "use client";

// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axiosApiInstance from "./lib/api";
// import { useRouter } from "next/navigation";
// import Pagination from "../components/Pagination";
// import { CiCircleMore } from "react-icons/ci";
// import { AiOutlineDelete } from "react-icons/ai";
// import { IoMdAdd } from "react-icons/io";
// import { AxiosError } from "axios";

// // Types
// export type Todo = {
//   id: number;
//   title: string;
//   description: string;
//   completed: boolean;
//   userId?: number | null;
// };

// type TodoApi = {
//   id: number;
//   todo: string;
//   completed: boolean;
//   userId: number;
// };

// export type TodosResponse = {
//   todos: TodoApi[];
// };

// // Local storage functions - only run on client side
// const LOCAL_STORAGE_KEY = "myTodosApp";

// export const getTodosFromLocalStorage = (): Todo[] => {
//   if (typeof window === "undefined") return [];
//   try {
//     const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
//     return storedTodos ? (JSON.parse(storedTodos) as Todo[]) : [];
//   } catch (error) {
//     console.error("Error reading from Local Storage:", error);
//     return [];
//   }
// };

// export const saveTodosToLocalStorage = (todos: Todo[]) => {
//   if (typeof window === "undefined") return;
//   try {
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
//   } catch (error) {
//     console.error("Error writing to Local Storage:", error);
//   }
// };

// const TodoList = () => {
//   const [deletingId, setDeletingId] = useState<number | null>(null);
//   const [mounted, setMounted] = useState(false);
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [currentPage, setCurrentPage] = useState(1);
//   const todosPerPage = 10;
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("ALL");

//   // Handle client-side mounting
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchTerm !== debouncedSearchTerm) {
//         setDebouncedSearchTerm(searchTerm);
//       }
//     }, 500);
//     return () => {
//       clearTimeout(timer);
//     };
//   }, [searchTerm, debouncedSearchTerm]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [debouncedSearchTerm, filterStatus]);

//   const {
//     data: todos,
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["todos", currentPage, debouncedSearchTerm, filterStatus],
//     queryFn: async () => {
//       let currentTodos = getTodosFromLocalStorage();

//       if (currentTodos.length === 0) {
//         console.log(
//           "Local Storage empty, fetching initial data from DummyJSON..."
//         );
//         try {
//           const response = await axiosApiInstance.get<TodosResponse>(
//             "/todos?limit=20"
//           );
//           currentTodos = response.data.todos.map((todo: TodoApi) => ({
//             id: todo.id,
//             title: todo.todo,
//             completed: todo.completed,
//             description: "No description from API",
//             userId: todo.userId || null,
//           }));
//           saveTodosToLocalStorage(currentTodos);
//         } catch (apiError) {
//           console.error(
//             "Failed to fetch initial todos from DummyJSON:",
//             apiError
//           );
//           currentTodos = [];
//         }
//       }

//       let filteredAndSearchedTodos = currentTodos;
//       if (debouncedSearchTerm) {
//         const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
//         filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
//           (todo: Todo) =>
//             todo.title.toLowerCase().includes(lowercasedSearchTerm)
//         );
//       }
//       if (filterStatus === "Completed") {
//         filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
//           (todo: Todo) => todo.completed
//         );
//       } else if (filterStatus === "Pending") {
//         filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
//           (todo: Todo) => !todo.completed
//         );
//       }
//       const totalFilteredCount = filteredAndSearchedTodos.length;
//       setTotalPages(Math.ceil(totalFilteredCount / todosPerPage) || 1);
//       const startIndex = (currentPage - 1) * todosPerPage;
//       const endIndex = startIndex + todosPerPage;
//       const paginatedTodos = filteredAndSearchedTodos.slice(
//         startIndex,
//         endIndex
//       );
//       return paginatedTodos;
//     },
//     staleTime: Infinity,
//     gcTime: 0,
//     enabled: mounted, // Only run query when component is mounted on client
//   });

//   const toggleTodoMutation = useMutation({
//     mutationFn: async ({
//       id,
//       completed,
//     }: {
//       id: number;
//       completed: boolean;
//     }) => {
//       const currentTodos = getTodosFromLocalStorage();
//       const updatedTodos = currentTodos.map((todo: Todo) =>
//         todo.id === id ? { ...todo, completed: completed } : todo
//       );
//       saveTodosToLocalStorage(updatedTodos);
//       queryClient.setQueryData(
//         ["todos", currentPage, debouncedSearchTerm, filterStatus],
//         (old: Todo[] | undefined) =>
//           old?.map((todo) =>
//             todo.id === id ? { ...todo, completed: completed } : todo
//           )
//       );
//       queryClient.setQueryData(
//         ["todo", id.toString()],
//         (oldTodo: Todo | undefined) =>
//           oldTodo ? { ...oldTodo, completed } : undefined
//       );
//       try {
//         await axiosApiInstance.patch(`/todos/${id}`, { completed: completed });
//         console.log(
//           `[OPTIONAL API CALL] Sent PATCH for todo ID ${id} to DummyJSON. (This is non-persistent).`
//         );
//       } catch (apiError: unknown) {
//         if (apiError instanceof AxiosError) {
//           console.warn(
//             `[OPTIONAL API CALL FAILED] DummyJSON PATCH for todo ID ${id} failed:`,
//             apiError.message
//           );
//         } else if (apiError instanceof Error) {
//           console.warn(
//             `[OPTIONAL API CALL FAILED] DummyJSON PATCH for todo ID ${id} failed:`,
//             apiError.message
//           );
//         } else {
//           console.warn(
//             `[OPTIONAL API CALL FAILED] DummyJSON PATCH for todo ID ${id} failed:`,
//             apiError
//           );
//         }
//       }
//       return { id, completed };
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//       console.log(
//         "Successfully toggled todo status (Local Storage) for ID:",
//         data.id
//       );
//     },
//     onError: (err, variables) => {
//       console.error("Error toggling todo status for ID:", variables.id, err);
//       alert(
//         `Failed to update todo: ${
//           err instanceof Error ? err.message : "Unknown error"
//         }. (Local Storage might still be updated, API failed).`
//       );
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//     },
//   });

//   const deleteTodoMutation = useMutation({
//     mutationFn: async (id: number) => {
//       const currentTodos = getTodosFromLocalStorage();
//       const updatedTodos = currentTodos.filter((todo) => todo.id !== id);
//       saveTodosToLocalStorage(updatedTodos);
//       queryClient.setQueryData(
//         ["todos", currentPage, debouncedSearchTerm, filterStatus],
//         (old: Todo[] | undefined) =>
//           old ? old.filter((todo) => todo.id !== id) : []
//       );
//       queryClient.removeQueries({
//         queryKey: ["todo", id.toString()],
//       });
//       try {
//         await axiosApiInstance.delete(`/todos/${id}`);
//         console.log(
//           `[OPTIONAL API CALL] Sent DELETE for todo ID ${id} to DummyJSON. (This is non-persistent).`
//         );
//       } catch (apiError: unknown) {
//         if (apiError instanceof AxiosError) {
//           console.warn(
//             `[OPTIONAL API CALL FAILED] DummyJSON DELETE for todo ID ${id} failed:`,
//             apiError.message
//           );
//         } else if (apiError instanceof Error) {
//           console.warn(
//             `[OPTIONAL API CALL FAILED] DummyJSON DELETE for todo ID ${id} failed:`,
//             apiError.message
//           );
//         } else {
//           console.warn(
//             `[OPTIONAL API CALL FAILED] DummyJSON DELETE for todo ID ${id} failed:`,
//             apiError
//           );
//         }
//       }
//       return id;
//     },
//     onSuccess: (deletedId) => {
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//       console.log(
//         "Successfully deleted todo from Local Storage ID:",
//         deletedId
//       );
//     },
//     onError: (err, deletedId) => {
//       console.error(
//         "CRITICAL ERROR: Failed to delete todo from Local Storage for ID:",
//         deletedId,
//         err
//       );
//       alert(
//         `A critical error occurred while deleting your todo locally: ${
//           err instanceof Error ? err.message : "Unknown error"
//         }. Your todo might not have been deleted.`
//       );
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//     },
//   });

//   const handleDeleteTodo = (id: number) => {
//     if (window.confirm(`Are you sure?`)) {
//       setDeletingId(id);
//       deleteTodoMutation.mutate(id, {
//         onSettled: () => setDeletingId(null),
//       });
//     }
//   };

//   const handleToggleComplete = (id: number, currentStatus: boolean) => {
//     toggleTodoMutation.mutate({ id, completed: !currentStatus });
//   };

//   const handleTodoClick = (id: number) => {
//     router.push(`/todo/${id}`);
//   };

//   const handlePageChange = (pageNumber: number) => {
//     if (pageNumber >= 1 && pageNumber <= totalPages) {
//       setCurrentPage(pageNumber);
//     }
//   };

//   // Show loading state until component is mounted
//   if (!mounted) {
//     return (
//       <div className="card w-96 bg-base-100 shadow-xl mx-auto mt-10">
//         <div className="card-body text-center">
//           <span className="loading loading-spinner loading-lg"></span>
//           <p>Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div
//         className="card w-96 bg-base-100 shadow-xl mx-auto mt-10"
//         role="status"
//         aria-live="polite"
//       >
//         <div className="card-body text-center">
//           <span
//             className="loading loading-spinner loading-lg"
//             aria-hidden="true"
//           ></span>
//           <p>Loading todos...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div
//         className="card w-96 bg-base-100 shadow-xl mx-auto mt-10"
//         role="alert"
//         aria-live="assertive"
//       >
//         <div className="card-body text-center text-error">
//           <p>
//             Error loading todos:{" "}
//             {error instanceof Error ? error.message : "Unknown error"}
//           </p>
//           <p>
//             Please check your internet connection or console for more details.
//           </p>
//           <button
//             className="btn btn-primary mt-4"
//             onClick={() =>
//               queryClient.invalidateQueries({ queryKey: ["todos"] })
//             }
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <main
//       className="card w-80 bg-base-100 shadow-xl mx-auto mt-10 md:w-96"
//       aria-labelledby="todo-list-heading"
//     >
//       <div className="card-body">
//         <h1
//           id="todo-list-heading"
//           className="card-title text-2xl font-bold mb-4"
//         >
//           API ToDo List
//         </h1>
//         <div className="flex items-center space-x-2 mb-4" role="search">
//           <label htmlFor="search-input" className="sr-only">
//             Search notes
//           </label>
//           <input
//             id="search-input"
//             type="text"
//             placeholder="Search note..."
//             className="input input-bordered w-full"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             aria-label="Search todos"
//           />
//           <label htmlFor="filter-status" className="sr-only">
//             Filter by status
//           </label>
//           <select
//             id="filter-status"
//             className="select select-bordered w-32"
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             aria-label="Filter todos by completion status"
//           >
//             <option value="ALL">ALL</option>
//             <option value="Completed">Completed</option>
//             <option value="Pending">Pending</option>
//           </select>
//         </div>
//         <div className="mb-4 text-center">
//           <button
//             className="btn btn-accent btn-block "
//             onClick={() => router.push("/add-todo")}
//             aria-label="Add new todo"
//           >
//             <IoMdAdd style={{ fontSize: "23px" }} aria-hidden="true" /> Add New
//             Todo
//           </button>
//         </div>
//         <div aria-live="polite" aria-atomic="true">
//           {todos && todos.length > 0 ? (
//             <ul className="space-y-3" role="list">
//               {todos.map((todo, index) => (
//                 <li
//                   key={`${todo.id}-${index}`}
//                   className="flex items-center space-x-3 bg-base-200 p-2 rounded-lg"
//                   role="listitem"
//                 >
//                   <input
//                     id={`todo-checkbox-${todo.id}`}
//                     type="checkbox"
//                     checked={todo.completed}
//                     onChange={() =>
//                       handleToggleComplete(todo.id, todo.completed)
//                     }
//                     className="checkbox checkbox-primary"
//                     aria-label={`Mark todo "${todo.title}" as ${
//                       todo.completed ? "incomplete" : "complete"
//                     }`}
//                   />
//                   <span
//                     className={`flex-grow ${
//                       todo.completed ? "line-through text-gray-500" : ""
//                     }`}
//                     id={`todo-title-${todo.id}`}
//                   >
//                     {todo.title}
//                   </span>
//                   <button
//                     className="btn btn-ghost btn-sm text-lg"
//                     onClick={() => handleTodoClick(todo.id)}
//                     aria-label={`View details for ${todo.title}`}
//                     aria-describedby={`todo-title-${todo.id}`}
//                     title={`View Details for ${todo.title}`}
//                   >
//                     <CiCircleMore aria-hidden="true" />
//                   </button>
//                   <button
//                     className="btn btn-ghost btn-sm"
//                     onClick={() => handleDeleteTodo(todo.id)}
//                     disabled={
//                       deleteTodoMutation.isPending && deletingId === todo.id
//                     }
//                     aria-label={`Delete todo: ${todo.title}`}
//                     aria-describedby={`todo-title-${todo.id}`}
//                   >
//                     {deleteTodoMutation.isPending && deletingId === todo.id ? (
//                       <span
//                         className="loading loading-spinner loading-xs"
//                         role="status"
//                         aria-label="Deleting todo"
//                       ></span>
//                     ) : (
//                       <AiOutlineDelete aria-hidden="true" />
//                     )}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-center text-gray-500">
//               No todos found for this page.
//             </p>
//           )}
//         </div>
//         {todos && totalPages > 1 && (
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={handlePageChange}
//           />
//         )}
//       </div>
//     </main>
//   );
// };

// export default TodoList;

// FIREBASE AUTH

// "use client";

// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axiosApiInstance from "../app/lib/api";
// import { useRouter } from "next/navigation";
// import Pagination from "../components/Pagination";
// import { CiCircleMore } from "react-icons/ci";
// import { AiOutlineDelete } from "react-icons/ai";
// import { IoMdAdd } from "react-icons/io";
// import AuthWrapper from "../components/AuthWrapper";
// import { AxiosError } from "axios";

// // Types
// export type Todo = {
//   id: number;
//   title: string;
//   description: string;
//   completed: boolean;
//   userId?: number | null;
// };

// type TodoApi = {
//   id: number;
//   todo: string;
//   completed: boolean;
//   userId: number;
// };

// export type TodosResponse = {
//   todos: TodoApi[];
// };

// // Local storage functions - only run on client side
// const LOCAL_STORAGE_KEY = "myTodosApp";

// export const getTodosFromLocalStorage = (): Todo[] => {
//   if (typeof window === "undefined") return [];
//   try {
//     const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
//     return storedTodos ? (JSON.parse(storedTodos) as Todo[]) : [];
//   } catch (error) {
//     console.error("Error reading from Local Storage:", error);
//     return [];
//   }
// };

// export const saveTodosToLocalStorage = (todos: Todo[]) => {
//   if (typeof window === "undefined") return;
//   try {
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
//   } catch (error) {
//     console.error("Error writing to Local Storage:", error);
//   }
// };

// const TodoList = () => {
//   const [deletingId, setDeletingId] = useState<number | null>(null);
//   const [mounted, setMounted] = useState(false);
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [currentPage, setCurrentPage] = useState(1);
//   const todosPerPage = 10;
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("ALL");

//   // Handle client-side mounting
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchTerm !== debouncedSearchTerm) {
//         setDebouncedSearchTerm(searchTerm);
//       }
//     }, 500);
//     return () => {
//       clearTimeout(timer);
//     };
//   }, [searchTerm, debouncedSearchTerm]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [debouncedSearchTerm, filterStatus]);
//   const {
//     data: todos,
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["todos", currentPage, debouncedSearchTerm, filterStatus],
//     queryFn: async () => {
//       let currentTodos = getTodosFromLocalStorage();

//       // Only fetch from DummyJSON if localStorage is empty
//       if (currentTodos.length === 0) {
//         console.log(
//           "Local Storage empty, fetching initial data from DummyJSON..."
//         );
//         try {
//           const response = await axiosApiInstance.get<TodosResponse>(
//             "/todos?limit=20"
//           );
//           currentTodos = response.data.todos.map((todo: TodoApi) => ({
//             id: todo.id,
//             title: todo.todo, // Note: DummyJSON uses 'todo' not 'title'
//             completed: todo.completed,
//             description: "No description from API",
//             userId: todo.userId || null,
//           }));
//           saveTodosToLocalStorage(currentTodos);
//         } catch (apiError) {
//           console.error(
//             "Failed to fetch initial todos from DummyJSON:",
//             apiError
//           );
//           currentTodos = [];
//         }
//       }

//       // Rest of your filtering logic stays the same...
//       let filteredAndSearchedTodos = currentTodos;
//       if (debouncedSearchTerm) {
//         const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
//         filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
//           (todo: Todo) =>
//             todo.title.toLowerCase().includes(lowercasedSearchTerm)
//         );
//       }
//       if (filterStatus === "Completed") {
//         filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
//           (todo: Todo) => todo.completed
//         );
//       } else if (filterStatus === "Pending") {
//         filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
//           (todo: Todo) => !todo.completed
//         );
//       }
//       const totalFilteredCount = filteredAndSearchedTodos.length;
//       setTotalPages(Math.ceil(totalFilteredCount / todosPerPage) || 1);
//       const startIndex = (currentPage - 1) * todosPerPage;
//       const endIndex = startIndex + todosPerPage;
//       const paginatedTodos = filteredAndSearchedTodos.slice(
//         startIndex,
//         endIndex
//       );
//       return paginatedTodos;
//     },
//     staleTime: Infinity,
//     gcTime: 0,
//     enabled: mounted,
//   });

//   const toggleTodoMutation = useMutation({
//     mutationFn: async ({
//       id,
//       completed,
//     }: {
//       id: number;
//       completed: boolean;
//     }) => {
//       try {
//         // Try database first
//         console.log(`Updating todo ${id} in database...`);
//         const response = await axiosApiInstance.patch(`/todos/${id}`, {
//           completed,
//         });
//         const updatedTodo = response.data;

//         // Update localStorage as backup
//         const currentTodos = getTodosFromLocalStorage();
//         const updatedTodos = currentTodos.map((todo: Todo) =>
//           todo.id === id ? { ...todo, completed } : todo
//         );
//         saveTodosToLocalStorage(updatedTodos);

//         console.log(
//           `Successfully updated todo ${id} in database and localStorage`
//         );
//         return updatedTodo;
//       } catch (dbError) {
//         console.warn(
//           `Database unavailable, updating localStorage only:`,
//           dbError
//         );

//         // Fallback to localStorage only
//         const currentTodos = getTodosFromLocalStorage();
//         const updatedTodos = currentTodos.map((todo: Todo) =>
//           todo.id === id ? { ...todo, completed } : todo
//         );
//         saveTodosToLocalStorage(updatedTodos);
//         return { id, completed };
//       }
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//       console.log(
//         "Successfully toggled todo status (Local Storage) for ID:",
//         data.id
//       );
//     },
//     onError: (err, variables) => {
//       console.error("Error toggling todo status for ID:", variables.id, err);
//       alert(
//         `Failed to update todo: ${
//           err instanceof Error ? err.message : "Unknown error"
//         }. (Local Storage might still be updated, API failed).`
//       );
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//     },
//   });

//   const deleteTodoMutation = useMutation({
//     mutationFn: async (id: number) => {
//       try {
//         // Try database first
//         console.log(`Deleting todo ${id} from database...`);
//         await axiosApiInstance.delete(`/todos/${id}`);

//         // Also remove from localStorage
//         const currentTodos = getTodosFromLocalStorage();
//         const updatedTodos = currentTodos.filter((todo) => todo.id !== id);
//         saveTodosToLocalStorage(updatedTodos);

//         console.log(
//           `Successfully deleted todo ${id} from database and localStorage`
//         );
//         return id;
//       } catch (dbError) {
//         console.warn(
//           `Database unavailable, deleting from localStorage only:`,
//           dbError
//         );

//         // Fallback to localStorage only
//         const currentTodos = getTodosFromLocalStorage();
//         const updatedTodos = currentTodos.filter((todo) => todo.id !== id);
//         saveTodosToLocalStorage(updatedTodos);
//         return id;
//       }
//     },
//     onSuccess: (deletedId) => {
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//       console.log(
//         "Successfully deleted todo from Local Storage ID:",
//         deletedId
//       );
//     },
//     onError: (err, deletedId) => {
//       console.error(
//         "CRITICAL ERROR: Failed to delete todo from Local Storage for ID:",
//         deletedId,
//         err
//       );
//       alert(
//         `A critical error occurred while deleting your todo locally: ${
//           err instanceof Error ? err.message : "Unknown error"
//         }. Your todo might not have been deleted.`
//       );
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//     },
//   });

//   const handleDeleteTodo = (id: number) => {
//     if (window.confirm(`Are you sure?`)) {
//       setDeletingId(id);
//       deleteTodoMutation.mutate(id, {
//         onSettled: () => setDeletingId(null),
//       });
//     }
//   };

//   const handleToggleComplete = (id: number, currentStatus: boolean) => {
//     toggleTodoMutation.mutate({ id, completed: !currentStatus });
//   };

//   const handleTodoClick = (id: number) => {
//     router.push(`/todo/${id}`);
//   };

//   const handlePageChange = (pageNumber: number) => {
//     if (pageNumber >= 1 && pageNumber <= totalPages) {
//       setCurrentPage(pageNumber);
//     }
//   };

//   // Show loading state until component is mounted
//   if (!mounted) {
//     return (
//       <div className="card w-96 bg-base-100 shadow-xl mx-auto mt-10">
//         <div className="card-body text-center">
//           <span className="loading loading-spinner loading-lg"></span>
//           <p>Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div
//         className="card w-96 bg-base-100 shadow-xl mx-auto mt-10"
//         role="status"
//         aria-live="polite"
//       >
//         <div className="card-body text-center">
//           <span
//             className="loading loading-spinner loading-lg"
//             aria-hidden="true"
//           ></span>
//           <p>Loading todos...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div
//         className="card w-96 bg-base-100 shadow-xl mx-auto mt-10"
//         role="alert"
//         aria-live="assertive"
//       >
//         <div className="card-body text-center text-error">
//           <p>
//             Error loading todos:
//             {error instanceof Error ? error.message : "Unknown error"}
//           </p>
//           <p>
//             Please check your internet connection or console for more details.
//           </p>
//           <button
//             className="btn btn-primary mt-4"
//             onClick={() =>
//               queryClient.invalidateQueries({ queryKey: ["todos"] })
//             }
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <AuthWrapper>
//       <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 px-4 main-wrapper dark-todo-app">
//         <div
//           className="card w-full max-w-lg bg-base-100 shadow-2xl rounded-2xl border border-gray-200 todo-card dark-card"
//           aria-labelledby="todo-list-heading"
//         >
//           <div className="card-body p-6 todo-card-body dark-card-body">
//             <h1
//               id="todo-list-heading"
//               className="card-title text-2xl font-bold mb-4 todo-title dark-title"
//             >
//               Your ToDo List
//             </h1>

//             {/* Search + Filter */}
//             <div
//               className="flex items-center space-x-2 mb-4 search-filter dark-search-section"
//               role="search"
//             >
//               <input
//                 id="search-input"
//                 type="text"
//                 placeholder="Search note..."
//                 className="input input-bordered w-full search-input dark-input"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 aria-label="Search todos"
//               />
//               <select
//                 id="filter-status"
//                 className="select select-bordered w-32 filter-select dark-select"
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 aria-label="Filter todos by completion status"
//               >
//                 <option value="ALL">ALL</option>
//                 <option value="Completed">Completed</option>
//                 <option value="Pending">Pending</option>
//               </select>
//             </div>

//             {/* Add Todo */}
//             <div className="mb-4 text-center add-todo-wrapper">
//               <button
//                 className="btn btn-accent btn-block add-todo-btn dark-add-btn"
//                 onClick={() => router.push("/add-todo")}
//                 aria-label="Add new todo"
//               >
//                 <IoMdAdd className="text-xl add-icon" aria-hidden="true" /> Add
//                 New Todo
//               </button>
//             </div>

//             {/* Todos */}
//             <div
//               className="todos-container dark-todos-container"
//               aria-live="polite"
//               aria-atomic="true"
//             >
//               {todos && todos.length > 0 ? (
//                 <ul className="space-y-3 todo-list dark-todo-list" role="list">
//                   {todos.map((todo) => (
//                     <li
//                       key={todo.id}
//                       className="flex items-center space-x-3 bg-base-200 p-2 rounded-lg todo-item dark-todo-item"
//                       role="listitem"
//                     >
//                       <input
//                         id={`todo-checkbox-${todo.id}`}
//                         type="checkbox"
//                         checked={todo.completed}
//                         onChange={() =>
//                           handleToggleComplete(todo.id, todo.completed)
//                         }
//                         className="checkbox checkbox-primary todo-checkbox dark-checkbox"
//                         aria-label={`Mark todo "${todo.title}" as ${
//                           todo.completed ? "incomplete" : "complete"
//                         }`}
//                       />
//                       <span
//                         className={`flex-grow ${
//                           todo.completed ? "line-through text-gray-500" : ""
//                         } todo-text dark-todo-text`}
//                         id={`todo-title-${todo.id}`}
//                       >
//                         {todo.title}
//                       </span>

//                       <div className="todo-actions dark-todo-actions flex gap-2">
//                         <button
//                           className="btn btn-ghost btn-sm text-lg view-btn dark-action-btn"
//                           onClick={() => handleTodoClick(todo.id)}
//                           title={`View Details for ${todo.title}`}
//                         >
//                           <CiCircleMore aria-hidden="true" />
//                         </button>
//                         <button
//                           className="btn btn-ghost btn-sm delete-btn dark-action-btn dark-delete-btn"
//                           onClick={() => handleDeleteTodo(todo.id)}
//                           disabled={
//                             deleteTodoMutation.isPending &&
//                             deletingId === todo.id
//                           }
//                         >
//                           {deleteTodoMutation.isPending &&
//                           deletingId === todo.id ? (
//                             <span className="loading loading-spinner loading-xs dark-spinner"></span>
//                           ) : (
//                             <AiOutlineDelete aria-hidden="true" />
//                           )}
//                         </button>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-center text-gray-500 no-todos dark-no-todos">
//                   No todos found for this page.
//                 </p>
//               )}
//             </div>

//             {/* Pagination */}
//             {todos && totalPages > 1 && (
//               <div className="pagination-wrapper dark-pagination">
//                 <Pagination
//                   currentPage={currentPage}
//                   totalPages={totalPages}
//                   onPageChange={handlePageChange}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </AuthWrapper>
//   );
// };

// export default TodoList;

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosApiInstance from "../app/lib/api";
import { useRouter } from "next/navigation";
import Pagination from "../components/Pagination";
import { CiCircleMore } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import AuthWrapper from "../components/AuthWrapper";
import { AxiosError } from "axios";

// Move all types and local storage functions into a separate file
// or keep them here, but DO NOT EXPORT THEM.
type Todo = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  userId?: number | null;
};

type TodoApi = {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
};

type TodosResponse = {
  todos: TodoApi[];
};

// Local storage functions - only run on client side
const LOCAL_STORAGE_KEY = "myTodosApp";

const getTodosFromLocalStorage = (): Todo[] => {
  if (typeof window === "undefined") return [];
  try {
    const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedTodos ? (JSON.parse(storedTodos) as Todo[]) : [];
  } catch (error) {
    console.error("Error reading from Local Storage:", error);
    return [];
  }
};

const saveTodosToLocalStorage = (todos: Todo[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Error writing to Local Storage:", error);
  }
};

const TodoList = () => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const todosPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["todos", currentPage, debouncedSearchTerm, filterStatus],
    queryFn: async () => {
      let currentTodos = getTodosFromLocalStorage();

      if (currentTodos.length === 0) {
        console.log(
          "Local Storage empty, fetching initial data from DummyJSON..."
        );
        try {
          const response = await axiosApiInstance.get<TodosResponse>(
            "/todos?limit=20"
          );
          currentTodos = response.data.todos.map((todo: TodoApi) => ({
            id: todo.id,
            title: todo.todo,
            completed: todo.completed,
            description: "No description from API",
            userId: todo.userId || null,
          }));
          saveTodosToLocalStorage(currentTodos);
        } catch (apiError) {
          console.error(
            "Failed to fetch initial todos from DummyJSON:",
            apiError
          );
          currentTodos = [];
        }
      }

      let filteredAndSearchedTodos = currentTodos;
      if (debouncedSearchTerm) {
        const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
        filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
          (todo: Todo) =>
            todo.title.toLowerCase().includes(lowercasedSearchTerm)
        );
      }
      if (filterStatus === "Completed") {
        filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
          (todo: Todo) => todo.completed
        );
      } else if (filterStatus === "Pending") {
        filteredAndSearchedTodos = filteredAndSearchedTodos.filter(
          (todo: Todo) => !todo.completed
        );
      }
      const totalFilteredCount = filteredAndSearchedTodos.length;
      setTotalPages(Math.ceil(totalFilteredCount / todosPerPage) || 1);
      const startIndex = (currentPage - 1) * todosPerPage;
      const endIndex = startIndex + todosPerPage;
      const paginatedTodos = filteredAndSearchedTodos.slice(
        startIndex,
        endIndex
      );
      return paginatedTodos;
    },
    staleTime: Infinity,
    gcTime: 0,
    enabled: mounted,
  });

  const toggleTodoMutation = useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: number;
      completed: boolean;
    }) => {
      try {
        console.log(`Updating todo ${id} in database...`);
        const response = await axiosApiInstance.patch(`/todos/${id}`, {
          completed,
        });
        const updatedTodo = response.data;

        const currentTodos = getTodosFromLocalStorage();
        const updatedTodos = currentTodos.map((todo: Todo) =>
          todo.id === id ? { ...todo, completed } : todo
        );
        saveTodosToLocalStorage(updatedTodos);

        console.log(
          `Successfully updated todo ${id} in database and localStorage`
        );
        return updatedTodo;
      } catch (dbError) {
        console.warn(`Database unavailable, updating localStorage only:`, dbError);

        const currentTodos = getTodosFromLocalStorage();
        const updatedTodos = currentTodos.map((todo: Todo) =>
          todo.id === id ? { ...todo, completed } : todo
        );
        saveTodosToLocalStorage(updatedTodos);
        return { id, completed };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      console.log(
        "Successfully toggled todo status (Local Storage) for ID:",
        data.id
      );
    },
    onError: (err, variables) => {
      console.error("Error toggling todo status for ID:", variables.id, err);
      alert(
        `Failed to update todo: ${
          err instanceof Error ? err.message : "Unknown error"
        }. (Local Storage might still be updated, API failed).`
      );
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        console.log(`Deleting todo ${id} from database...`);
        await axiosApiInstance.delete(`/todos/${id}`);

        const currentTodos = getTodosFromLocalStorage();
        const updatedTodos = currentTodos.filter((todo) => todo.id !== id);
        saveTodosToLocalStorage(updatedTodos);

        console.log(`Successfully deleted todo ${id} from database and localStorage`);
        return id;
      } catch (dbError) {
        console.warn(`Database unavailable, deleting from localStorage only:`, dbError);

        const currentTodos = getTodosFromLocalStorage();
        const updatedTodos = currentTodos.filter((todo) => todo.id !== id);
        saveTodosToLocalStorage(updatedTodos);
        return id;
      }
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      console.log(
        "Successfully deleted todo from Local Storage ID:",
        deletedId
      );
    },
    onError: (err, deletedId) => {
      console.error("CRITICAL ERROR: Failed to delete todo from Local Storage for ID:", deletedId, err);
      alert(
        `A critical error occurred while deleting your todo locally: ${
          err instanceof Error ? err.message : "Unknown error"
        }. Your todo might not have been deleted.`
      );
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
    router.push(`/todo/${id}`);
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (!mounted) {
    return (
      <div className="card w-96 bg-base-100 shadow-xl mx-auto mt-10">
        <div className="card-body text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="card w-96 bg-base-100 shadow-xl mx-auto mt-10"
        role="status"
        aria-live="polite"
      >
        <div className="card-body text-center">
          <span
            className="loading loading-spinner loading-lg"
            aria-hidden="true"
          ></span>
          <p>Loading todos...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="card w-96 bg-base-100 shadow-xl mx-auto mt-10"
        role="alert"
        aria-live="assertive"
      >
        <div className="card-body text-center text-error">
          <p>
            Error loading todos:
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <p>
            Please check your internet connection or console for more details.
          </p>
          <button
            className="btn btn-primary mt-4"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["todos"] })
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthWrapper>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 px-4 main-wrapper dark-todo-app">
        <div
          className="card w-full max-w-lg bg-base-100 shadow-2xl rounded-2xl border border-gray-200 todo-card dark-card"
          aria-labelledby="todo-list-heading"
        >
          <div className="card-body p-6 todo-card-body dark-card-body">
            <h1
              id="todo-list-heading"
              className="card-title text-2xl font-bold mb-4 todo-title dark-title"
            >
              Your ToDo List
            </h1>

            <div
              className="flex items-center space-x-2 mb-4 search-filter dark-search-section"
              role="search"
            >
              <input
                id="search-input"
                type="text"
                placeholder="Search note..."
                className="input input-bordered w-full search-input dark-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search todos"
              />
              <select
                id="filter-status"
                className="select select-bordered w-32 filter-select dark-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter todos by completion status"
              >
                <option value="ALL">ALL</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="mb-4 text-center add-todo-wrapper">
              <button
                className="btn btn-accent btn-block add-todo-btn dark-add-btn"
                onClick={() => router.push("/add-todo")}
                aria-label="Add new todo"
              >
                <IoMdAdd className="text-xl add-icon" aria-hidden="true" /> Add
                New Todo
              </button>
            </div>

            <div
              className="todos-container dark-todos-container"
              aria-live="polite"
              aria-atomic="true"
            >
              {todos && todos.length > 0 ? (
                <ul className="space-y-3 todo-list dark-todo-list" role="list">
                  {todos.map((todo) => (
                    <li
                      key={todo.id}
                      className="flex items-center space-x-3 bg-base-200 p-2 rounded-lg todo-item dark-todo-item"
                      role="listitem"
                    >
                      <input
                        id={`todo-checkbox-${todo.id}`}
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() =>
                          handleToggleComplete(todo.id, todo.completed)
                        }
                        className="checkbox checkbox-primary todo-checkbox dark-checkbox"
                        aria-label={`Mark todo "${todo.title}" as ${
                          todo.completed ? "incomplete" : "complete"
                        }`}
                      />
                      <span
                        className={`flex-grow ${
                          todo.completed ? "line-through text-gray-500" : ""
                        } todo-text dark-todo-text`}
                        id={`todo-title-${todo.id}`}
                      >
                        {todo.title}
                      </span>

                      <div className="todo-actions dark-todo-actions flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm text-lg view-btn dark-action-btn"
                          onClick={() => handleTodoClick(todo.id)}
                          title={`View Details for ${todo.title}`}
                        >
                          <CiCircleMore aria-hidden="true" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm delete-btn dark-action-btn dark-delete-btn"
                          onClick={() => handleDeleteTodo(todo.id)}
                          disabled={
                            deleteTodoMutation.isPending &&
                            deletingId === todo.id
                          }
                        >
                          {deleteTodoMutation.isPending &&
                          deletingId === todo.id ? (
                            <span className="loading loading-spinner loading-xs dark-spinner"></span>
                          ) : (
                            <AiOutlineDelete aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 no-todos dark-no-todos">
                  No todos found for this page.
                </p>
              )}
            </div>

            {todos && totalPages > 1 && (
              <div className="pagination-wrapper dark-pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </AuthWrapper>
  );
};

// Next.js convention: export a default function from the page file
export default function Page() {
  return <TodoList />;
}
