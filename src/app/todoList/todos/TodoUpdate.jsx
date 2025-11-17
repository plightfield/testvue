import {
  ElButton,
  ElColorPicker,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus'
import { defineComponent } from 'vue'
import useTodos from './useTodos'

export default defineComponent(() => {
  const todos = useTodos()
  let formRef = null
  return () => (
    <ElForm
      ref={(el) => (formRef = el)}
      rules={{
        content: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        color: [{ required: true, message: '颜色不能为空', trigger: 'blur' }],
        time: [{ required: true, message: '时间不能为空', trigger: 'blur' }],
      }}
      model={todos.model}
    >
      <ElFormItem label="内容" prop="content">
        <ElInput v-model={todos.model.content} />
      </ElFormItem>
      <ElFormItem label="颜色" prop="color">
        <ElColorPicker v-model={todos.model.color} />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSelect v-model={todos.model.status}>
          {[
            { label: '等待中', value: 'waiting' },
            { label: '进行中', value: 'actived' },
            { label: '已完成', value: 'finished' },
            { label: '已延期', value: 'delay' },
          ].map((item) => (
            <ElOption key={item.value} label={item.label} value={item.value} />
          ))}
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="生效时间" prop="time">
        <ElDatePicker type="datetime" v-model={todos.model.time} format="YYYY-MM-DD HH:mm:ss" />
      </ElFormItem>
      <ElFormItem label="是否紧急">
        <el-radio-group v-model={todos.model.emergency}>
          <el-radio value="0" size="large">
            非紧急
          </el-radio>
          <el-radio value="1" size="large">
            紧急
          </el-radio>
        </el-radio-group>
      </ElFormItem>
      <div className="flex justify-end">
        <ElButton
          size="large"
          type="primary"
          onClick={() => {
            formRef
              .validate()
              .then(() => {
                todos.updateTodo()
              })
              .catch((e) => {
                ElMessage.warning('请按照要求填写表单')
              })
          }}
        >
          确认修改
        </ElButton>
      </div>
    </ElForm>
  )
})
