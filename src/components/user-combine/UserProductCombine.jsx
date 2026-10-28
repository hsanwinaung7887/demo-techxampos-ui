import UserCommonNavbar from "../user/UserCommonNavbar"
import UserProductPage from "../user/UserProductPage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserProductCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserProductPage></UserProductPage>
        </div>
    )
}
export default UserProductCombine