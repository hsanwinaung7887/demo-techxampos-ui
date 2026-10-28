export const initialState={
    ownerLoginDatas:[],
    error:null
}

export const ownerLoginReducer=(state, action) => {
    switch(action.type)
    {
        case "fetch": return{...state,ownerLoginDatas:action.payload}
        case "add":
        case "update":
        case "delete":
    }
}