import UserCommonNavbar from "../user/UserCommonNavbar"
import UserCategoryPage from "../user/UserCategoryPage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserCategoryCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserCategoryPage></UserCategoryPage>
        </div>
    )
}
export default UserCategoryCombine