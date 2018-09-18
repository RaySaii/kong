import { getState, update } from './utils/index'

export const Home={
    get:state=>state,
    set:update
}
export const Other={
    get:getState('other'),
    set:update
}
