import UserCommonNavbar from "../user/UserCommonNavbar"
import UserAccountUPEPage from "../user/UserAccountUPEPage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserAccountUPECombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserAccountUPEPage></UserAccountUPEPage>
        </div>
    )
}
export default UserAccountUPECombine