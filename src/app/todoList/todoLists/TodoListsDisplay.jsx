import { defineComponent, computed } from 'vue'
import useTodoLists from './useTodoLists'
import dayjs from 'dayjs'
import { ElButton, ElDialog, ElMessageBox } from 'element-plus'
import TodoCreateUpdate from './TodoListCreateUpdate'
export default defineComponent(() => {
  const todoLists = useTodoLists()
  const showDialog = computed({
    get: () => todoLists.openCreateUpdate !== undefined,
    set: (val) => {
      if (!val) todoLists.openCreateUpdate = undefined
    },
  })
  return () => (
    <>
      <ElDialog
        title={todoLists.openCreateUpdate ? '编辑清单' : '添加清单'}
        v-model={showDialog.value}
      >
        <TodoCreateUpdate />
      </ElDialog>
      {todoLists.displayList.map((el, idx) => (
        // 排序，key 就是 idx
        <div key={idx + '' + el.sortId} className="py-2 pr-4">
          <div
            class={{
              'shadow p-2 cursor-pointer group transition-all rounded': true,
              'bg-white hover:bg-blue-500 hover:text-white': todoLists.selectedId !== el.id,
              'bg-blue-500 text-white': todoLists.selectedId === el.id,
            }}
            onClick={() => {
              todoLists.selectedId = el.id
            }}
          >
            <div>{el.title}</div>
            <div className="flex justify-between">
              <div
                class={{
                  'text-[12px]': true,
                  'text-neutral-600 group-hover:text-white': todoLists.selectedId !== el.id,
                  'text-white': todoLists.selectedId === el.id,
                }}
              >
                {dayjs(el.created).format('YYYY-MM-DD HH:mm')}
              </div>
              <div className="flex items-center">
                {idx !== 0 && (
                  <ElButton
                    circle
                    icon="ArrowUpBold"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      todoLists.swtichTodoList(idx, -1)
                    }}
                  />
                )}

                {idx !== todoLists.displayList.length - 1 && (
                  <ElButton
                    circle
                    icon="ArrowDownBold"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      todoLists.swtichTodoList(idx, 1)
                    }}
                  />
                )}
                <ElButton
                  circle
                  icon="Edit"
                  size="small"
                  type="primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    todoLists.openCreateUpdate = el
                  }}
                />
                <ElButton
                  circle
                  icon="Delete"
                  type="danger"
                  size="small"
                  onClick={() => {
                    ElMessageBox.confirm('确认删除该待办清单吗？', '删除待办清单', {
                      confirmButtonText: '确认',
                      cancelButtonText: '取消',
                      type: 'warning',
                    }).then(() => {
                      todoLists.removeTodoList(el.id)
                    })
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
})
