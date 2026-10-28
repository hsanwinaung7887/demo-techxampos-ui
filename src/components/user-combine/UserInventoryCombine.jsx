import UserCommonNavbar from "../user/UserCommonNavbar"
import UserInventoryPage from "../user/UserInventoryPage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserInventoryCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserInventoryPage></UserInventoryPage>
        </div>
    )
}
export default UserInventoryCombine