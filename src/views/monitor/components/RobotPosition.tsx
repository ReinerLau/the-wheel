import Konva from 'konva'
import { Group } from 'konva/lib/Group'
import { Layer } from 'konva/lib/Layer'
import { Stage } from 'konva/lib/Stage'
import { PropType, defineComponent, onMounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'RobotPosition',
  props: {
    bgImg: {
      type: String,
      default: '',
    },
    pos: {
      type: Object as PropType<{
        x: number
        y: number
        theta: number
      }>,
      default: () => ({ x: 0, y: 0, theta: 0 }),
    },
  },
  setup(props) {
    // 舞台容器 DOM 元素
    const stageRef = ref<HTMLDivElement>()

    // 舞台实例
    let konvaStage: Stage

    // 舞台背景加载 loading
    const loading = ref(false)

    // 舞台相比背景图片的缩放比例
    let scale: number

    // 存放背景图片的图层实例
    let konvaLayer: Layer

    // 机器人位置点缩放比例
    let pointScale = 1

    // 存放机器人位置点和箭头的组实例
    let group: Group

    onMounted(() => {
      konvaStage = new Konva.Stage({
        container: stageRef.value,
        width: 0,
        height: 0,
      })
      initBackgroundImage(props.bgImg)
    })

    // 监听到接收的图片数据变化，初始化背景图片
    watch(() => props.bgImg, initBackgroundImage)

    // 监听到接收到的机器人位置数据变化，初始化位置
    watch(() => props.pos, initPos)

    // 初始化背景图片
    function initBackgroundImage(url: string) {
      clearStage()
      if (!url) return
      const img = new Image()
      img.src = url
      loading.value = true
      img.onload = onImgLoad
    }

    // 监听到背景图片加载完毕
    function onImgLoad() {
      setStageSize(this)

      const konvaImage = new Konva.Image({
        image: this,
        width: konvaStage.width(),
        height: konvaStage.height(),
      })

      initLayer(konvaImage)

      initPos()

      konvaStage.add(konvaLayer)

      loading.value = false
    }

    // 清空舞台
    function clearStage() {
      pointScale = 1
      konvaStage.size({ width: 0, height: 0 })
      konvaStage.removeChildren()
    }

    // 设置舞台宽高
    function setStageSize(img) {
      konvaStage.width(stageRef.value.clientWidth)
      scale = konvaStage.width() / img.width
      konvaStage.height(img.height * scale)
    }

    // 初始化图层
    function initLayer(konvaImage) {
      konvaLayer = new Konva.Layer({
        draggable: true,
        dragBoundFunc: () => ({ x: 0, y: 0 }),
      })

      konvaLayer.add(konvaImage)

      konvaLayer.on('wheel', layerZoom)
    }

    // 图层滚动缩放事件
    function layerZoom(e) {
      // 取消默认事件
      e.evt.preventDefault()
      handlePointSize(e)
      // 缩放比例
      const scaleBy = 1.2
      let newScale = konvaLayer.scaleX()
      if (e.evt.deltaY < 0) {
        newScale = newScale * scaleBy
      } else {
        newScale = newScale / scaleBy < 1 ? 1 : newScale / scaleBy
      }
      handleZoomCenter(newScale)
      konvaLayer.scale({ x: newScale, y: newScale })
      handleZoomOutScope()
    }

    // 控制滚动缩放的中心
    function handleZoomCenter(newScale) {
      const pointerPosition = konvaLayer.getRelativePointerPosition()
      const pointXScale = pointerPosition.x / konvaStage.width()
      const pointYScale = pointerPosition.y / konvaStage.height()
      // 缩放前图层宽高
      const oldScale = konvaLayer.scaleX()
      const oldWidth = konvaStage.width() * oldScale
      const oldHeight = konvaStage.height() * oldScale
      // 缩放后图层宽高
      const newWidth = konvaStage.width() * newScale
      const newHeight = konvaStage.height() * newScale
      // 缩放后图层位置
      konvaLayer.position({
        x: konvaLayer.x() - (newWidth - oldWidth) * pointXScale,
        y: konvaLayer.y() - (newHeight - oldHeight) * pointYScale,
      })
    }

    // 处理缩放后的可拖拽边界
    function handleZoomOutScope() {
      const scale = konvaLayer.scaleX()
      const leftX = konvaLayer.x()
      const rightX = konvaLayer.x() + konvaStage.width() * scale
      const topY = konvaLayer.y()
      const bottomY = konvaLayer.y() + konvaStage.height() * scale
      if (leftX > 0) {
        konvaLayer.x(0)
      }
      if (rightX < konvaStage.width()) {
        konvaLayer.x(-(konvaStage.width() * (scale - 1)))
      }
      if (topY > 0) {
        konvaLayer.y(0)
      }
      if (bottomY < konvaStage.height()) {
        konvaLayer.y(-(konvaStage.height() * (scale - 1)))
      }
      // 处理缩放后拖拽范围
      const maxDragOffset = {
        x: -(konvaStage.width() * (scale - 1)),
        y: -(konvaStage.height() * (scale - 1)),
      }
      konvaLayer.dragBoundFunc((pos) => {
        let x = 0
        let y = 0
        if (pos.x > 0) {
          x = 0
        } else if (pos.x <= maxDragOffset.x) {
          x = maxDragOffset.x
        } else {
          x = pos.x
        }
        if (pos.y > 0) {
          y = 0
        } else if (pos.y <= maxDragOffset.y) {
          y = maxDragOffset.y
        } else {
          y = pos.y
        }
        return { x, y }
      })
    }

    // 初始化机器人位置点
    function initPos() {
      if (!scale) return
      if (group) group.destroy()
      group = new Konva.Group({
        x: props.pos.x * scale,
        y: props.pos.y * scale,
        scale: {
          x: pointScale,
          y: pointScale,
        },
      })
      const point = new Konva.Circle({
        radius: 5,
        fill: '#e33',
      })
      const arrow = new Konva.Arrow({
        points: [0, 0, 0, -15],
        pointerLength: 3,
        pointerWidth: 3,
        fill: '#e33',
        stroke: '#e33',
        strokeWidth: 2,
        rotation: props.pos.theta,
      })
      group.add(point)
      group.add(arrow)
      konvaLayer.add(group)
    }

    // 控制机器人位置点缩放比例
    function handlePointSize(e) {
      // 缩放比例
      const scaleBy = 1.2
      if (e.evt.deltaY < 0) {
        pointScale = pointScale / scaleBy
      } else {
        pointScale = pointScale * scaleBy > 1 ? 1 : pointScale * scaleBy
      }
      group.scale({ x: pointScale, y: pointScale })
    }

    return () => <div ref={stageRef} v-loading={loading.value} class="w-full"></div>
  },
})
