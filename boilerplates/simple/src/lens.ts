import { getState, update } from './utils/index'

export const test={
    get:state=>state,
    set:update
}
export const other={
    get:getState('other'),
    set:update
}
