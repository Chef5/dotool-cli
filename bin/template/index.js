import baseComponent from '../helpers/baseComponent';

baseComponent({
  properties: {
    // 标题
    text: {
      type: String,
      value: '默认标题',
    },
  },
  data: {
    image: '',
  },
  lifetimes: {
    attached: function () {
      this.onThemeChange();
    },
  },
  methods: {
    // 组件库封装函数：当主题改变时触发
    onThemeChange() {
      this.setData({
        image: `${this.properties.ossUrl}/patient/skin/${this.properties.theme}/v1.0.08/list.png`,
      });
    },
  },
})