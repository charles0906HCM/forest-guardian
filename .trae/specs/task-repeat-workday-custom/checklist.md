# 任务重复选项增强 - Verification Checklist

- [x] RepeatType 类型包含 "workday" 和 "custom"
- [x] Task 接口包含 repeatDays: number[] 字段
- [x] 旧任务数据加载不报错（repeatDays 默认为空数组）
- [x] repeatTypeLabel 函数支持 workday 和 custom 中文标签
- [x] isTaskActiveOnDate 函数正确处理 workday 类型（周一至周五显示，周六日不显示）
- [x] isTaskActiveOnDate 函数正确处理 custom 类型（仅在选中的星期显示）
- [x] 任务表单显示5个重复选项按钮
- [x] 选择"工作日"重复后任务仅在周一至周五出现
- [x] 选择"自定义"后下方显示星期选择器
- [x] 星期选择器可复选多个天数
- [x] 编辑任务时正确加载已有的 repeatDays
- [x] 自定义未选任何天时保存提示"请至少选择一天"
- [x] 保存任务时 repeatDays 正确传入
- [x] 重复提示文案正确显示新类型说明
- [x] TypeScript 类型检查通过
