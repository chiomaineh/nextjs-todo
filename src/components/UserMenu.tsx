// 'use client'

// import { useAuth } from '../context/AuthContext';

// export default function UserMenu() {
//   const { user, logout } = useAuth();

//   if (!user) return null;

//   return (
//     <div className="flex items-center gap-3 mb-4">
//       <div className="avatar">
//         <div className="w-8 rounded-full">
//           <img 
//             src={user.photoURL || '/default-avatar.png'} 
//             alt={user.displayName || 'User'} 
//           />
//         </div>
//       </div>
//       <div className="flex-grow">
//         <p className="text-sm font-medium">{user.displayName}</p>
//         <p className="text-xs text-gray-500">{user.email}</p>
//       </div>
//       <button 
//         onClick={logout}
//         className="btn btn-ghost btn-sm"
//       >
//         Logout
//       </button>
//     </div>
//   );
// }

'use client'

import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

 return (
  <div className="flex items-center justify-between gap-3 mb-4 user-menu-dark">
    {/* Avatar */}
    <div className="avatar user-avatar-dark">
      <div className="w-6 rounded-full">
        <img
          src={user.photoURL || "/default-avatar.png"}
          alt={user.displayName || "User"}
        />
      </div>
    </div>

    {/* User Info */}
    <div className="flex-grow user-info-dark">
      <p className="text-sm font-medium user-name-dark">
        {user.displayName}
      </p>
      <p className="text-xs text-gray-500 user-email-dark">{user.email}</p>
    </div>

    {/* Logout button */}
    <button
      onClick={logout}
      className="btn btn-ghost btn-sm logout-btn-dark"
    >
      Logout
    </button>
  </div>
);

}