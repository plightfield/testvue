import { ref, reactive, computed, watch, onMounted, toRaw } from 'vue'
import useTodoListStore from '../useTodoListStore'
import { defineStore } from 'pinia'

export default defineStore('todoLists', () => {
  const store = useTodoListStore()
  const selectedId = ref('')
  const selected = computed(() => store.getTodoList(selectedId.value))
  const displayList = computed(() => {
    // 读取数据的响应式，方法必须纯
    // 而且因为修改了 sortId，必须用 map 迭代（取值取到了 sortId），否则不会触发响应式更新
    // 这是 Proxy 的固有问题，不过影响不大（Solid 用 immer 变更可以解决此问题，但是断绝了 v-model 的使用，请开发者权衡）
    return [...store.data].map((item) => ({ ...item })).sort((a, b) => b.sortId - a.sortId)
  })
  // 交换顺序
  const swtichTodoList = (idx1, direction) => {
    // 操作必须全部依赖于 store
    const item1 = store.getTodoList(displayList.value[idx1].id)
    if (!item1) return
    const idx2 = idx1 + direction
    if (!displayList.value[idx2]) return
    const item2 = store.getTodoList(displayList.value[idx2].id)
    if (!item2) return
    const sortId1 = item1.sortId
    store.createUpdateTodoList(item1.id, { sortId: item2.sortId })
    store.createUpdateTodoList(item2.id, { sortId: sortId1 })
  }
  // 选中第一个
  const _resetToFirestId = () => {
    const firstId = displayList.value[0]?.id || ''
    if (firstId) selectedId.value = firstId
  }
  // 改变选项时，加载缓存时，选中第一个
  watch(selectedId, (id) => {
    if (!store.getTodoList(id)) {
      _resetToFirestId()
    }
  })
  watch(
    // pinia 会把 ref 解包，所以这里直接用 store.loaded
    () => store.loaded,
    () => {
      console.log('sdfsdf')
      _resetToFirestId()
    },
  )
  // 打开新增编辑弹框
  // 新增编辑共用一个标识的方案：
  // undefined 表示关闭，传入对象表示打开并编辑该对象,null 表示打开新增
  const openCreateUpdate = ref(undefined)

  const model = reactive({
    title: '',
  })

  const createUpdateTodoList = () => {
    if (openCreateUpdate.value) {
      store.createUpdateTodoList(openCreateUpdate.value.id, { title: model.title })
    } else {
      const id = store.createUpdateTodoList('', { title: model.title })
      if (id) {
        selectedId.value = id
      }
    }
  }

  // 回填逻辑
  watch(openCreateUpdate, (val) => {
    if (val) {
      model.title = val.title || ''
    } else {
      model.title = ''
    }
  })

  const removeTodoList = (listId) => {
    store.removeTodoList(listId)
    if (selectedId.value === listId) {
      _resetToFirestId()
    }
  }
  return {
    selectedId,
    selected,
    displayList,
    swtichTodoList,
    createUpdateTodoList,
    removeTodoList,
    openCreateUpdate,
    model,
  }
})
