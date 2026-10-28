import UserCommonNavbar from "../user/UserCommonNavbar"
import UserCreditPage from "../user/UserCreditPage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserCreditPageCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserCreditPage></UserCreditPage>
        </div>
    )
}
export default UserCreditPageCombine