import { useState } from "react";
import SharedNavbar from "./SharedNavbar";
import SharedFooter from "./SharedFooter";
import { Outlet } from "react-router-dom";

const SharedCoverPageCombine = () => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("pos-language") || "en";
    });

    return(
        <div className="CoverPageCombine-main">
            <SharedNavbar language={language} setLanguage={setLanguage} />
            {/* Outlet ကို context အနေနဲ့ language ပို့ပေးရမယ် */}
            <Outlet context={{ language, setLanguage }} />
            <SharedFooter />
        </div>
    )
}

export default SharedCoverPageCombine;