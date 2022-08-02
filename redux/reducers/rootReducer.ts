import {HYDRATE} from 'next-redux-wrapper';
import {State,ActionType} from 'portal/types'
import {Reducer} from 'redux'

const initialState: State={
    user:null,
    config:null,
    theme:'auto',
    redux_theme:'light',
    toggleDrawer:true,
    report:null,
    totalNotif:0,
    token:null,
    debugToken:null,
    disableHotkeys:false,
    call:{
        isCall:false,
        interval:null,
        callType:null,
        callPerson:{},
        dialer:false,
        callShow:false,
        callAccept:false,
    }
}

const rootReducer: Reducer<State,ActionType> = (state = initialState, action) => {
    switch (action.type) {
        case HYDRATE:
            const nextState={
                ...state
            }
            if(action?.payload?.user) nextState.user=action?.payload.user;
            if(action?.payload?.config) nextState.config=action?.payload.config;
            if(action?.payload?.token) nextState.token=action?.payload.token;
            if(action?.payload?.debugToken) nextState.debugToken=action?.payload.debugToken;
            return nextState
        case 'CONFIG':
            return {...state, config: action?.payload};
        case 'USER':
            return {...state, user: action?.payload};
        case 'CHANGE_THEME':
            return {...state, theme: action?.payload};
        case 'REDUX_THEME':
            return {...state, redux_theme: action?.payload}; 
        case 'TOGGLE_DRAWER':
            return {...state, toggleDrawer: action?.payload};
        case 'REPORT':
            return {...state,report:action?.payload}
        case 'TOTAL_NOTIF':
            return {...state,totalNotif:action?.payload}
        case 'TOKEN':
            return {...state,token:action?.payload}
        case 'CALL':
            return {...state,call:action?.payload}
        case 'CUSTOM':
            return {...state,...action?.payload}
        default:
            return {...state};
    }
};

export default rootReducer;