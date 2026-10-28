import UserCommonNavbar from "../user/UserCommonNavbar"
import UserReturnPage from "../user/UserReturnPage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserReturnCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserReturnPage></UserReturnPage>
        </div>
    )
}
export default UserReturnCombine