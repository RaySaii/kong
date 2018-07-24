import { getState, update } from './utils'

export const Home={
    get:state=>state,
    set:update
}
export const Other={
    get:getState('other'),
    set:update
}
