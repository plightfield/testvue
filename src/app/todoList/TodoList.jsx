import { ElCard } from 'element-plus'
import { defineComponent } from 'vue'
import useTodoLists from './todoLists/useTodoLists'
import TodoListsDisplay from './todoLists/TodoListsDisplay'
import TodosDisplay from './todos/TodosDisplay'
export default defineComponent(() => {
  const todoLists = useTodoLists()
  return () => (
    <ElCard>
      {{
        header: () => (
          <div className="flex justify-between items-center">
            <h2>演示待办清单</h2>
            <div>
              <ElButton
                onClick={() => {
                  todoLists.openCreateUpdate = null
                }}
              >
                添加待办清单
              </ElButton>
            </div>
          </div>
        ),
        default: () => (
          <div className="flex bg-neutral-50 p-4">
            <div className="w-[280px] grow-0">
              <TodoListsDisplay />
            </div>
            <div className="grow">
              <TodosDisplay />
            </div>
          </div>
        ),
      }}
    </ElCard>
  )
})
