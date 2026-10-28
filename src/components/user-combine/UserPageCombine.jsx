import { Outlet } from "react-router-dom";
import UserCommonNavbar from "../user/UserCommonNavbar";
import "../../light-style/user-combine-css/userPageCombine.css";
import { useCart } from "../user/CartContent";

const UserPageCombine = () => {
  const { heldCarts } = useCart();

  const handleShowHeldCarts = () => {
    window.dispatchEvent(new CustomEvent("showHeldCartsModal"));
  };

  return (
    <div className="userPageCombine-main">
      <UserCommonNavbar 
        onShowHeldCarts={handleShowHeldCarts}
        heldCartsCount={heldCarts.length}
      />
      <Outlet />
    </div>
  );
};

export default UserPageCombine;