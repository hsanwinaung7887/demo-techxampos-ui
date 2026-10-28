// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles = [], allowedUserTypes = [] }) => {
  const { isAuthenticated, user, userType: reduxUserType } = useSelector((state) => state.auth);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const activeUser = user || storedUser;
  const activeUserType = reduxUserType || storedUser?.userType || 'shop';

  // ✅ Demo: user မရှိရင် DEMO user ကို သုံး
  const demoUser = activeUser || {
    id: 1,
    username: 'demo_user',
    fullName: 'Demo User',
    role: 'SHOP_OWNER',
    userType: 'shop',
    status: 'Active',
    branchId: 1,
    branchCode: 'branch',
    shopId: 1,
  };

  // ✅ Demo: block မလုပ်တော့ဘူး
  // if (!activeAuth || !activeUser) {
  //   return <Navigate to="/" replace />;
  // }

  // ✅ Role check (Demo: ဖြေလျော့)
  if (allowedRoles.length > 0 && !allowedRoles.includes(demoUser.role)) {
    console.warn(`⚠️ Role "${demoUser.role}" is not in allowed roles:`, allowedRoles);
    // Demo မှာ block မလုပ်တော့ဘူး → continue
  }

  // ✅ UserType check (Demo: ဖြေလျော့)
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(activeUserType)) {
    console.warn(`⚠️ UserType "${activeUserType}" is not in allowed types:`, allowedUserTypes);
    // Demo မှာ block မလုပ်တော့ဘူး → continue
  }

  return children;
};

export default ProtectedRoute;