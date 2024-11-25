import { ElMessage } from 'element-plus'
class CRUD {
  constructor() {
  }

  async launch(callbaack) {
    try {
      const result = await callbaack()
      if (Number(result.code) !== 200) ElMessage.error(result.msg || '请求失败，请重试...')
      return { data: result.data || [], code: Number(result.code) }
    } catch (err) {
      const error_message = JSON.parse(err.message).data?.msg || '未知错误'
      ElMessage.error('请求失败，错误信息：' + error_message)
    }
  }
}
export default new CRUD()
