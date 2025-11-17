import { ref, reactive, onUnmounted, watch, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuid } from 'uuid'
import dayjs from 'dayjs'
import { todoScheduler$ } from '../shared/scheduler'
import { Subject, takeUntil, tap } from 'rxjs'
import { ElMessage } from 'element-plus'
import localforage from 'localforage'

const sortTag = () => dayjs().valueOf() * 10000 + Math.trunc(Math.random() * 10000)

export const initialValues = [
  {
    id: uuid(),
    title: '学习 Vue',
    created: dayjs().subtract(2, 'day').valueOf(),
    sortId: sortTag(),
    todos: [
      {
        id: uuid(),
        color: 'gray',
        content: '阅读官方文档',
        status: 'finished',
        time: dayjs().subtract(2, 'day').add(2, 'hour').valueOf(),
        emergency: true,
      },
    ],
  },
]

export default defineStore('todoList', () => {
  const data = reactive(initialValues)
  const getTodoList = (listId) => data.find((item) => item.id === listId)
  const getTodo = (listId, todoId) => getTodoList(listId)?.todos.find((item) => item.id === todoId)
  const activeTime = ref(10) // 测试 10 秒激活时间

  const createUpdateTodoList = (listId, newItem) => {
    if (listId) {
      const item = getTodoList(listId)
      if (item) {
        const merge = {
          title: newItem.title || item.title,
          sortId: newItem.sortId || item.sortId,
        }
        Object.assign(item, merge)
      }
    } else {
      const id = uuid()
      data.push({
        title: newItem.title || '新建待办清单',
        id,
        sortId: sortTag(),
        created: dayjs().valueOf(),
        todos: [],
      })
      return id
    }
  }

  const removeTodoList = (listId) => {
    const len = data.length
    if (len <= 1) {
      ElMessage.warning('至少保留一个待办清单')
      return
    }
    const index = data.findIndex((item) => item.id === listId)
    if (index > -1) {
      data.splice(index, 1)
    }
  }

  const createTodo = (listId, content) => {
    const list = getTodoList(listId)
    if (list) {
      const id = uuid()
      list.todos.push({
        content,
        id,
        color: 'gray',
        status: 'waiting',
        // 默认 20 秒后激活，方便测试
        time: dayjs().add(20, 'second').valueOf(),
        emergency: false,
      })
      return id
    }
  }
  const updateTodo = (todoId, newItem) => {
    for (const todoList of data) {
      for (const todo of todoList.todos) {
        if (todo.id === todoId) {
          const _n = { ...newItem }
          delete _n.id
          Object.assign(todo, _n)
          return
        }
      }
    }
  }
  const removeTodo = (todoId) => {
    for (const todoList of data) {
      const index = todoList.todos.findIndex((item) => item.id === todoId)
      if (index > -1) {
        todoList.todos.splice(index, 1)
        return
      }
    }
  }

  const finishTodo = (todoId) => {
    for (const todoList of data) {
      for (const todo of todoList.todos) {
        if (todo.id === todoId) {
          if (todo.status === 'waiting' || todo.status === 'actived') todo.status = 'finished'
          return
        }
      }
    }
  }

  const over$ = new Subject()
  todoScheduler$
    .pipe(
      takeUntil(over$),
      tap(() => {
        const now = dayjs().valueOf()
        for (const todoList of data) {
          for (const todo of todoList.todos) {
            if (todo.status === 'actived' && todo.time + activeTime.value * 1000 <= now) {
              todo.status = 'delay'
            }
            if (todo.status === 'waiting' && todo.time <= now) {
              todo.status = 'actived'
            }
          }
        }
      }),
    )
    .subscribe()

  onUnmounted(() => {
    // 实际上可以省略，因为是全局逻辑，但是写在这里提醒注意内存泄漏问题
    over$.next(true)
  })

  // 拓展：持久化
  // 不推荐用 pinia 插件实现持久化，会破坏建模一致性
  // 分不分 store 和要不要做持久化没有关系，只对数据进行持久化
  watch(
    data,
    (val) => {
      const d = toRaw(val)
      localforage.setItem('todoListData', d)
    },
    { deep: true },
  )

  const loaded = ref(false)
  ;(() => {
    localforage.getItem('todoListData').then((val) => {
      if (val) {
        data.splice(0, data.length, ...val)
      }
      loaded.value = true
    })
  })()
  return {
    data,
    getTodoList,
    getTodo,
    createUpdateTodoList,
    removeTodoList,
    createTodo,
    updateTodo,
    removeTodo,
    finishTodo,
    activeTime,
    loaded,
  }
})
