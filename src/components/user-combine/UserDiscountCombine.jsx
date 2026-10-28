import UserCommonNavbar from "../user/UserCommonNavbar"
import UserDiscountPage from "../user/UserDiscountPage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserDiscountCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserDiscountPage></UserDiscountPage>
        </div>
    )
}
export default UserDiscountCombine