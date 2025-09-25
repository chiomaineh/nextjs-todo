// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import axiosApiInstance from "../api/api";

// export interface Todo {
//   id: number;
//   title: string;
//   description: string;
//   completed: boolean;
//   // ✅ FIX: Change the userId type to allow for 'null'
//   userId: number | null; 
// }

// const LOCAL_STORAGE_KEY = "myTodosApp";

// const getTodosFromLocalStorage = (): Todo[] => {
//   try {
//     const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
//     return storedTodos ? (JSON.parse(storedTodos) as Todo[]) : [];
//   } catch (error) {
//     console.error("Error reading from Local Storage:", error);
//     return [];
//   }
// };

// const saveTodosToLocalStorage = (todos: Todo[]) => {
//   try {
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
//   } catch (error) {
//     console.error("Error writing to Local Storage:", error);
//   }
// };

// const AddTodo = () => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");

//   const addTodoMutation = useMutation({
//     mutationFn: async (newTodoData: { title: string; description: string }) => {
//       const newLocalTodo: Todo = {
//         id: Date.now(),
//         title: newTodoData.title,
//         description: newTodoData.description,
//         completed: false,
//         userId: 1,
//       };

//       const currentTodos = getTodosFromLocalStorage();
//       const updatedTodos = [...currentTodos, newLocalTodo];
//       saveTodosToLocalStorage(updatedTodos);

//       try {
//         await axiosApiInstance.post("/todos/add", {
//           todo: newTodoData.title,
//           completed: false,
//           userId: 1,
//         });
//         console.log("Sent POST request to DummyJSON (not persistent on their side).");
//       } catch (apiError) {
//         console.warn("Failed to send todo to DummyJSON API. (This won't affect local persistence).", apiError);
//       }

//       return newLocalTodo;
//     },
//     onSuccess: (addedTodoLocal) => {
//       queryClient.invalidateQueries({ queryKey: ["todos"] });
//       console.log("Todo added successfully (Local Storage & UI updated):", addedTodoLocal);
//       alert(`Todo "${addedTodoLocal.title}" added!. Click on the 3rd page to view your newly added todo! `);
//       navigate("/");
//     },
//     onError: (error) => {
//       console.error("Error adding todo:", error);
//       alert(`Failed to add todo: ${error.message}. Check console for details.`);
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
//     navigate("/");
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
//               Error: {addTodoMutation.error.message}
//             </p>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddTodo;