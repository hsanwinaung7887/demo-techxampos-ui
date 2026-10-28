import UserCommonNavbar from "../user/UserCommonNavbar"
import UserAdminDashboard from "../user/UserAdminDashboard"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserAdminDashboardCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserAdminDashboard></UserAdminDashboard>
        </div>
    )
}
export default UserAdminDashboardCombine