import UserCommonNavbar from "../user/UserCommonNavbar"
import UserAccountManagementPage from "../user/UserAccountManagementPage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserAccountManagementCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserAccountManagementPage></UserAccountManagementPage>
        </div>
    )
}
export default UserAccountManagementCombine