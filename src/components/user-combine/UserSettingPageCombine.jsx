import UserCommonNavbar from "../user/UserCommonNavbar"
import UserSettingPage from "../user/UserSettingPage"
import "../../light-style/user-combine-css/userCategoryCombine.css"

const UserSettingPageCombine=()=> {
    return(
        <div className="userCategoryCombine-main">
            <UserCommonNavbar></UserCommonNavbar>
            <UserSettingPage></UserSettingPage>
        </div>
    )
}
export default UserSettingPageCombine