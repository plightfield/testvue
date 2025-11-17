import dayjs from 'dayjs'

// 有时间意义的唯一 id，交换即可排序
export const sortTag = () => dayjs().valueOf() * 10000 + Math.trunc(Math.random() * 10000)
