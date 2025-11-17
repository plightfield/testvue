import { defineComponent, computed } from 'vue'
import useTodos from './useTodos'
import { ElButton, ElInput, ElMessageBox, ElTag } from 'element-plus'
import dayjs from 'dayjs'
import TodoUpdate from './TodoUpdate'
export default defineComponent(() => {
  const todos = useTodos()
  const showOpen = computed({
    get: () => todos.selected !== null,
    set: (val) => {
      if (!val) todos.selected = null
    },
  })
  return () => (
    <div>
      <ElDialog title={'编辑待办'} v-model={showOpen.value}>
        <TodoUpdate />
      </ElDialog>
      {todos.displayList.map((item) => (
        <div className="p-2 flex flex-col">
          <div className="shadow-lg p-2 rounded bg-white">
            <div className="flex">
              <div className="w-[120px] flex gap-2">
                {item.emergency && <ElTag type="danger">紧急</ElTag>}
                {item.status === 'waiting' ? (
                  <ElTag type="info">等待中</ElTag>
                ) : item.status === 'actived' ? (
                  <ElTag type="danger">进行中</ElTag>
                ) : item.status === 'finished' ? (
                  <ElTag type="success">已完成</ElTag>
                ) : item.status === 'delay' ? (
                  <ElTag type="warning">已延期</ElTag>
                ) : null}
              </div>
              <div>
                <div
                  className="inline-block w-4 h-4 rounded"
                  style={{
                    backgroundColor: item.color,
                  }}
                ></div>{' '}
                {item.content}
              </div>
            </div>
            <div className="flex justify-between items-center pl-[120px]">
              <div className="text-[12px] text-neutral-600">
                {dayjs(item.time).format('YYYY-MM-DD HH:mm')}
              </div>
              <div className="flex items-center">
                <ElButton
                  size="small"
                  icon="Edit"
                  onClick={() => {
                    todos.selected = item
                  }}
                />
                <ElButton
                  size="small"
                  icon="WarningFilled"
                  type={item.emergency ? 'warning' : 'info'}
                  onClick={() => {
                    todos.toggleEmergency(item.id)
                  }}
                />
                <ElButton
                  size="small"
                  icon="Check"
                  type="primary"
                  onClick={() => {
                    todos.finishTodo(item.id)
                  }}
                />
                <ElButton
                  size="small"
                  icon="Delete"
                  type="danger"
                  onClick={() => {
                    ElMessageBox.confirm('确认删除该待办吗？', '删除待办', {
                      confirmButtonText: '确认',
                      cancelButtonText: '取消',
                      type: 'warning',
                    }).then(() => {
                      todos.removeTodo(item.id)
                    })
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="p-2">
        <ElInput
          placeholder="回车键添加"
          v-model={todos.subInputValue}
          onKeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              todos.createTodo()
            }
          }}
        ></ElInput>
      </div>
    </div>
  )
})
