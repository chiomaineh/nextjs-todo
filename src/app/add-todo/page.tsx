"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosApiInstance from "../lib/api";

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  userId: number | null;
}

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

const AddTodo = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const addTodoMutation = useMutation({
    mutationFn: async (newTodoData: { title: string; description: string }) => {
      const newLocalTodo: Todo = {
        id: Date.now(),
        title: newTodoData.title,
        description: newTodoData.description,
        completed: false,
        userId: 1,
      };

      const currentTodos = getTodosFromLocalStorage();
      const updatedTodos = [...currentTodos, newLocalTodo];
      saveTodosToLocalStorage(updatedTodos);

      try {
        await axiosApiInstance.post("/todos/add", {
          todo: newTodoData.title,
          completed: false,
          userId: 1,
        });
        console.log(
          "Sent POST request to DummyJSON (not persistent on their side)."
        );
      } catch (apiError) {
        console.warn(
          "Failed to send todo to DummyJSON API. (This won't affect local persistence).",
          apiError
        );
      }

      return newLocalTodo;
    },
    onSuccess: (addedTodoLocal) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      console.log(
        "Todo added successfully (Local Storage & UI updated):",
        addedTodoLocal
      );
      alert(
        `Todo "${addedTodoLocal.title}" added!. Click on the 3rd page to view your newly added todo! `
      );
      router.push("/");
    },
    onError: (error) => {
      console.error("Error adding todo:", error);
      alert(
        `Failed to add todo: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Check console for details.`
      );
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.trim() === "") {
      alert("Title cannot be empty!");
      return;
    }
    addTodoMutation.mutate({ title, description });
  };

  const handleCancel = () => {
    router.push("/");
  };

return (
  <div className="card w-full max-w-2xl bg-base-100 shadow-xl mx-auto mt-10 add-todo-card">
    <div className="card-body add-todo-body">
      <h2 className="card-title text-2xl font-bold mb-4 add-todo-title">
        Add New Todo
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6 add-todo-form">
        
        {/* Title */}
        <label className="form-control w-full add-todo-label">
          <div className="label">
            <span className="label-text">Title</span>
          </div>
          <input
            type="text"
            placeholder="Todo title"
            className="input input-bordered w-full add-todo-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        {/* Description */}
        <label className="form-control w-full add-todo-label">
          <div className="label">
            <span className="label-text">Description</span>
          </div>
          <textarea
            placeholder="Detailed description"
            className="textarea textarea-bordered h-32 w-full add-todo-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </label>

        {/* Buttons */}
        <div className="card-actions mt-8 submit-todo">
          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={addTodoMutation.isPending}
          >
            {addTodoMutation.isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Add Todo"
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost cancel-btn"
            onClick={handleCancel}
            disabled={addTodoMutation.isPending}
          >
            Cancel
          </button>
        </div>

        {/* Error */}
        {addTodoMutation.isError && (
          <p className="text-error text-sm mt-2 error-msg">
            Error:{" "}
            {addTodoMutation.error instanceof Error
              ? addTodoMutation.error.message
              : "Unknown error"}
          </p>
        )}
      </form>
    </div>
  </div>
);


};

export default AddTodo;

// // PERSONAL DATABASE
// 'use client'

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import axiosApiInstance from "../lib/api";

// export interface Todo {
//   id: number;
//   title: string;
//   description: string;
//   completed: boolean;
//   userId: number | null;
// }

// const LOCAL_STORAGE_KEY = "myTodosApp";

// const getTodosFromLocalStorage = (): Todo[] => {
//   if (typeof window === 'undefined') return [];
//   try {
//     const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
//     return storedTodos ? (JSON.parse(storedTodos) as Todo[]) : [];
//   } catch (error) {
//     console.error("Error reading from Local Storage:", error);
//     return [];
//   }
// };

// const saveTodosToLocalStorage = (todos: Todo[]) => {
//   if (typeof window === 'undefined') return;
//   try {
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
//   } catch (error) {
//     console.error("Error writing to Local Storage:", error);
//   }
// };

// const AddTodo = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");

//   const addTodoMutation = useMutation({
//     mutationFn: async (newTodoData: { title: string; description: string }) => {
//       const newTodo: Todo = {
//         id: Date.now(),
//         title: newTodoData.title,
//         description: newTodoData.description,
//         completed: false,
//         userId: 1,
//       };

//       try {
//         // Try database first
//         console.log("Adding todo to database...");
//         const response = await axiosApiInstance.post("/todos", newTodo);
//         const savedTodo = response.data;

//         // Also save to localStorage as backup
//         const currentTodos = getTodosFromLocalStorage();
//         const updatedTodos = [...currentTodos, savedTodo];
//         saveTodosToLocalStorage(updatedTodos);

//         console.log("Successfully added todo to database and localStorage");
//         return savedTodo;
//       } catch (dbError) {
//         console.warn("Database unavailable, saving to localStorage only:", dbError);

//         // Fallback to localStorage only
//         const currentTodos = getTodosFromLocalStorage();
//         const updatedTodos = [...currentTodos, newTodo];
//         saveTodosToLocalStorage(updatedTodos);

//         return newTodo;
//       }
//     },
//     onSuccess: (addedTodoLocal) => {
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//       console.log("Todo added successfully (Local Storage & UI updated):", addedTodoLocal);
//       alert(`Todo "${addedTodoLocal.title}" added!. Click on the 3rd page to view your newly added todo! `);
//       router.push("/");
//     },
//     onError: (error) => {
//       console.error("Error adding todo:", error);
//       alert(`Failed to add todo: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//     },
//   });

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (title.trim() === "") {
//       alert("Title cannot be empty!");
//       return;
//     }
//     addTodoMutation.mutate({ title, description });
//   };

//   const handleCancel = () => {
//     router.push("/");
//   };

//   return (
//     <div className="card w-80 bg-base-100 shadow-xl mx-auto mt-10 md:w-96">
//       <div className="card-body">
//         <h2 className="card-title text-2xl font-bold mb-4">Add New Todo</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <label className="form-control w-full">
//             <div className="label">
//               <span className="label-text">Title</span>
//             </div>
//             <input
//               type="text"
//               placeholder="Todo title"
//               className="input input-bordered w-full"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//             />
//           </label>
//           <label className="form-control w-full">
//             <div className="label">
//               <span className="label-text">Description</span>
//             </div>
//             <textarea
//               placeholder="Detailed description"
//               className="textarea textarea-bordered h-24 w-full"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             ></textarea>
//           </label>
//           <div className="card-actions justify-end mt-6">
//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={addTodoMutation.isPending}
//             >
//               {addTodoMutation.isPending ? (
//                 <span className="loading loading-spinner loading-sm"></span>
//               ) : (
//                 "Add Todo"
//               )}
//             </button>
//             <button
//               type="button"
//               className="btn btn-ghost"
//               onClick={handleCancel}
//               disabled={addTodoMutation.isPending}
//             >
//               Cancel
//             </button>
//           </div>
//           {addTodoMutation.isError && (
//             <p className="text-error text-sm mt-2">
//               Error: {addTodoMutation.error instanceof Error ? addTodoMutation.error.message : 'Unknown error'}
//             </p>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddTodo;
