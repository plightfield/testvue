import { animationFrameScheduler, interval } from 'rxjs'

// 每秒执行一次，使用 animationFrameScheduler 调度
export const todoScheduler$ = interval(1000, animationFrameScheduler)
