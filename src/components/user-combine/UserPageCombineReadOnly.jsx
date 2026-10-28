import { Outlet } from "react-router-dom";
import "../../light-style/user-combine-css/userPageCombine.css";
import { useCart } from "../user/CartContent";
import UserCommonNavbarReadOnly from "../user/UserCommonNavbarReadOnly";

const UserPageCombineReadOnly = () => {
  const { heldCarts } = useCart();

  const handleShowHeldCarts = () => {
    window.dispatchEvent(new CustomEvent("showHeldCartsModal"));
  };

  return (
    <div className="userPageCombine-main">
      <UserCommonNavbarReadOnly
        onShowHeldCarts={handleShowHeldCarts}
        heldCartsCount={heldCarts.length}
      />
      <Outlet />
    </div>
  );
};

export default UserPageCombineReadOnly;