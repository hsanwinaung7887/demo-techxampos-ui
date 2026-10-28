import { useState, useEffect } from "react";
import "../../light-style/user-css/userSaleNavbar.css"
import menuIcon from "../../assets/icons/menu-icon.png";
import barcode from "../../assets/icons/barcode.png";
import cart from "../../assets/icons/cart.png";
import wifi from "../../assets/icons/wifi.png";
import logo from "../../assets/icons/xamLogo.png"
import reload from"../../assets/icons/reload.png"
import user from"../../assets/icons/user.png"


const UserSaleNavbar=()=> {
    const getInitials = (name) => {
    return name
        .replace(/\./g, "")        // dot ဖယ်
        .split(" ")                // space ဖြင့်ခွဲ
        .filter(word => word.length > 0)
        .map(word => word[0].toUpperCase())
        .join("");
    };

    const MENUS = [
        "ProductList",
        "Sale",
        "Category",
        "Discount",
        ];
    const LOGOUT = "Logout";

    const [open, setOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(
        localStorage.getItem("activeMenu") || "Sale"
    );
    
        useEffect(() => {
        localStorage.setItem("activeMenu", activeMenu);
        }, [activeMenu]);
    
    return(
        <div className="userSaleMenuBar-main">
            <div className="user-sale-menubar-container">
            <div className="menuBar-left">
                <button className="icon-btn" onClick={() => setOpen(true)}>
                    <img src={menuIcon} alt="menu" />
                </button>
                <img src={logo} alt="logo" className="menu-logo" />
            </div>
            <div className="menuBar-right">
                <label className="time tooltip" htmlFor="" data-tooltip="12:00AM (Sat)">12:00AM</label>
                <button className="icon-btn wifi"><img src={wifi} alt="" /></button>
                <button className="icon-btn"><img src={reload} alt="" /></button>
                <button className="icon-btn"><img src={barcode} alt="" /></button>
                <button className="icon-btn"><img src={cart} alt="" /></button>
                <button className="icon-btn pf-btn tooltip"  data-tooltip="Mr. San Win Aung">
                    <img className="pf" src={user} alt="" />
                    <span className="name-full">San Win Aung</span>
                    <span className="name-short">{getInitials("San Win Aung")}</span></button>
            </div>
            </div>
    
            {/* Slide Menu */}
            <div className={`side-menu ${open ? "open" : ""}`}>
                <div className="side-menu-header">
                <h3>Menu</h3>
                <span onClick={() => setOpen(false)}>   ✕</span>
                </div>

            {MENUS.map(item => (
            <div
                key={item}
                className={`side-menu-item ${
                activeMenu === item ? "active" : ""
                }`}
                onClick={() => {
                setActiveMenu(item);
                setOpen(false);
                }}
            >
                {item}
            </div>
            ))}
    
            {/* Logout at bottom */}
            <div
                className="side-menu-item logout"
                onClick={() => {
                localStorage.removeItem("activeMenu");
                // 👉 logout logic here
                console.log("logout");
                }}
            >
                Logout
            </div>
            </div>

            {/* Overlay */}
            {open && <div className="menu-overlay" onClick={() => setOpen(false)} />}
        </div>
        )
}
export default UserSaleNavbar