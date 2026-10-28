import { useState, useEffect } from "react";
import UserCommonNavbar from "../user/UserCommonNavbar";
import UserSalePage from "../user/UserSalePage";
import "../../light-style/user-combine-css/userCategoryCombine.css";

const UserSalePageCombine = () => {
  const [heldCarts, setHeldCarts] = useState([]);
  const [showHeldCartsModal, setShowHeldCartsModal] = useState(false);

  // Load held carts from localStorage on component mount
  useEffect(() => {
    const savedCarts = localStorage.getItem("heldCarts");
    if (savedCarts) {
      setHeldCarts(JSON.parse(savedCarts));
    }

    // Listen for held carts updates from UserSalePage
    const handleStorageChange = () => {
      const updatedCarts = localStorage.getItem("heldCarts");
      if (updatedCarts) {
        setHeldCarts(JSON.parse(updatedCarts));
      }
    };

    // Set up event listener for storage changes
    window.addEventListener("storage", handleStorageChange);
    
    // Also check localStorage periodically
    const interval = setInterval(() => {
      const savedCarts = localStorage.getItem("heldCarts");
      if (savedCarts) {
        const parsed = JSON.parse(savedCarts);
        if (JSON.stringify(parsed) !== JSON.stringify(heldCarts)) {
          setHeldCarts(parsed);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [heldCarts]);

  // Handle showing held carts modal
  const handleShowHeldCarts = () => {
    // We need to trigger the modal in UserSalePage
    // We can pass a prop or use a ref, but for simplicity
    // We'll use a custom event
    const event = new CustomEvent("showHeldCartsModal");
    window.dispatchEvent(event);
  };

  return (
    <div className="userCategoryCombine-main">
      <UserCommonNavbar 
        onShowHeldCarts={handleShowHeldCarts}
        heldCartsCount={heldCarts.length}
      />
      <UserSalePage />
    </div>
  );
};

export default UserSalePageCombine;