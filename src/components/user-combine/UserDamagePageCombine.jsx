import UserCommonNavbar from "../user/UserCommonNavbar"
import UserDamagePage from "../user/UserDamagePage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserDamagePageCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserDamagePage></UserDamagePage>
        </div>
    )
}
export default UserDamagePageCombine