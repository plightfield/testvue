import { ElButton, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'
import { defineComponent } from 'vue'
import useTodoLists from './useTodoLists'
export default defineComponent(() => {
  const todoLists = useTodoLists()
  let formRef = null
  return () => (
    <ElForm
      ref={(el) => (formRef = el)}
      rules={{
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
      }}
      model={todoLists.model}
    >
      <ElFormItem label="标题" prop="title">
        <ElInput v-model={todoLists.model.title} />
      </ElFormItem>
      <div className="flex justify-end">
        <ElButton
          size="large"
          type="primary"
          onClick={() => {
            console.log(todoLists.model)
            formRef
              .validate()
              .then(() => {
                todoLists.createUpdateTodoList()
                todoLists.openCreateUpdate = undefined
              })
              .catch((e) => {
                console.log(e)
                ElMessage.warning('请按照要求填写表单')
              })
          }}
        >
          确认{todoLists.openCreateUpdate ? '修改' : '添加'}
        </ElButton>
      </div>
    </ElForm>
  )
})
