import { ref, reactive, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import useTodoLists from '../todoLists/useTodoLists'
import useTodoListStore from '../useTodoListStore'
import dayjs from 'dayjs'

export default defineStore('todos', () => {
  const store = useTodoListStore()
  const todoLists = useTodoLists()
  const displayList = computed(() => {
    const now = dayjs()
    const list = (store.getTodoList(todoLists.selectedId)?.todos || []).filter((item) =>
      dayjs(item.time).isSame(now, 'day'),
    )
    const emergencies = []
    const activeds = []
    const finisheds = []
    const deleys = []
    const waitings = []
    for (const item of list) {
      if (item.emergency) {
        emergencies.push({ ...item })
      } else if (item.status === 'actived') {
        activeds.push({ ...item })
      } else if (item.status === 'finished') {
        finisheds.push({ ...item })
      } else if (item.status === 'delay') {
        deleys.push({ ...item })
      } else if (item.status === 'waiting') {
        waitings.push({ ...item })
      }
    }
    return [
      ...emergencies.sort((a, b) => a.created - b.created),
      ...activeds.sort((a, b) => a.created - b.created),
      ...finisheds.sort((a, b) => a.created - b.created),
      ...deleys.sort((a, b) => a.created - b.created),
      ...waitings.sort((a, b) => a.created - b.created),
    ]
  })
  const subInputValue = ref('')
  const createTodo = () => {
    const val = subInputValue.value
    store.createTodo(todoLists.selectedId, val)
    subInputValue.value = ''
  }

  const toggleEmergency = (todoId) => {
    const todo = store.getTodo(todoLists.selectedId, todoId)
    if (!todo) return
    const mergency = !todo.emergency
    store.updateTodo(todoId, { emergency: mergency })
  }
  const model = reactive({
    content: '',
    color: 'gray',
    status: 'waiting',
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    emergency: '0',
  })
  const selected = ref(null)
  watch(selected, (val) => {
    if (val) {
      Object.assign(model, {
        ...val,
        time: dayjs(val.time).format('YYYY-MM-DD HH:mm:ss'),
        emergency: val.emergency ? '1' : '0',
      })
    }
  })
  const updateTodo = (id) => {
    if (!selected.value) return
    store.updateTodo(selected.value.id, {
      ...model,
      time: dayjs(model.time).valueOf(),
      emergency: model.emergency === '1',
    })
    selected.value = null
  }
  return {
    displayList,
    subInputValue,
    createTodo,
    finishTodo: store.finishTodo,
    removeTodo: store.removeTodo,
    toggleEmergency,
    model,
    selected,
    updateTodo,
  }
})
