export const initialState={
    ownerOtpLoginDatas:[],
    error:null
}

export const ownerLoginReducer=(state, action) => {
    switch(action.type)
    {
        case "fetch": return{...state,ownerOtpLoginDatas:action.payload}
        case "add":
        case "update":
        case "delete":
    }
}