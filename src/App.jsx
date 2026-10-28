import SharedNavbar from "./components/shared/SharedNavbar"
import SharedCoverPage from "./components/shared/SharedCoverPage"
import SharedFooter from "./components/shared/SharedFooter"
import SharedCoverPageCombine from "./components/shared/SharedCoverPageCombine"
import AppRoutes from "./routes/AppRoutes"
import OwnerLogin from "./components/owner/OwnerLogin"

import "./App.css"

const App =()=> {
  return(
    <div className="App-main">
      <AppRoutes></AppRoutes>
    </div>
  )
}
export default App