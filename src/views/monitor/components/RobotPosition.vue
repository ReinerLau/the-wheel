<template>
  <!-- 舞台容器 -->
  <div
    ref="stageRef"
    v-loading="loading"
    class="w-full h-full flex justify-center items-center"
  ></div>
</template>

<script setup lang="ts">
import Konva from 'konva'
import { Group } from 'konva/lib/Group'
import { Layer } from 'konva/lib/Layer'
import { Stage } from 'konva/lib/Stage'
import { onMounted, ref, toRefs } from 'vue'

/**
 * 组件属性定义
 */
const props = defineProps<{
  /** 背景图片地址 */
  map?: string
  /** 机器人位置信息，可能为 null */
  pos: {
    x: number
    y: number
    theta: number
  } | null
  /** 充电点位置信息，可能为 null */
  chargingPoint?: {
    x: number
    y: number
    theta: number
  } | null
}>()

// 解构 props 以避免直接修改
const { map } = toRefs(props)
// 不解构 pos，因为它可能是 null

/** 舞台容器 DOM 元素 */
const stageRef = ref<HTMLDivElement>()

/** 舞台实例 */
let konvaStage: Stage

/** 舞台背景加载 loading */
const loading = ref(false)

/** 舞台相比背景图片的缩放比例 */
let scale = 1

/** 存放背景图片的图层实例 */
let konvaLayer: Layer

/** 存放机器人位置点和箭头的组实例 */
let group: Group

/** 存放充电点位置点和箭头的组实例 */
let chargingPointGroup: Group

let img: HTMLImageElement

/**
 * 初始化背景图片
 * 直接使用 props 中的 map 属性
 */
function initBackgroundImage() {
  if (!map.value) return
  img = new Image()
  img.src = map.value
  loading.value = true
  img.onload = onImgLoad
}

/**
 * 监听到背景图片加载完毕
 * @param img 已加载的图片元素
 */
function onImgLoad() {
  setStageSize(img)

  const konvaImage = new Konva.Image({
    image: img,
    width: konvaStage.width(),
    height: konvaStage.height(),
  })

  initLayer(konvaImage)

  konvaStage.add(konvaLayer)

  // 初始化机器人位置和充电点位置
  initPos()
  initChargingPoint()

  loading.value = false
}

/**
 * 清空舞台
 */
function clearStage() {
  konvaStage.size({ width: 0, height: 0 })
  konvaStage.removeChildren()
}

/**
 * 设置舞台宽高
 * @param img 图片元素
 */
function setStageSize(img: HTMLImageElement) {
  if (!stageRef.value) return
  if (img.width >= img.height) {
    konvaStage.width(stageRef.value.clientWidth)
    scale = konvaStage.width() / img.width
    konvaStage.height(img.height * scale)
  } else {
    konvaStage.height(stageRef.value.clientHeight)
    scale = konvaStage.height() / img.height
    konvaStage.width(img.width * scale)
  }
}

/**
 * 初始化图层
 * @param konvaImage Konva图像对象
 */
function initLayer(konvaImage: Konva.Image) {
  konvaLayer = new Konva.Layer()

  konvaLayer.add(konvaImage)
}

/**
 * 初始化机器人位置点
 * 如果位置信息为 null，则不显示位置点
 */
function initPos() {
  if (!props.pos) return
  if (group) group.destroy()

  group = new Konva.Group({
    x: props.pos.x * scale,
    y: props.pos.y * scale,
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

/**
 * 初始化充电点位置
 * 如果充电点位置信息为 null，则不显示充电点
 */
function initChargingPoint() {
  if (!props.chargingPoint) return
  if (
    props.chargingPoint.theta === null ||
    props.chargingPoint.x === null ||
    props.chargingPoint.y === null
  )
    return
  if (chargingPointGroup) chargingPointGroup.destroy()

  chargingPointGroup = new Konva.Group({
    x: props.chargingPoint.x * scale,
    y: props.chargingPoint.y * scale,
  })
  const point = new Konva.Circle({
    radius: 5,
    fill: '#FBBF23',
  })
  const arrow = new Konva.Arrow({
    points: [0, 0, 0, -15],
    pointerLength: 3,
    pointerWidth: 3,
    fill: '#FBBF23',
    stroke: '#FBBF23',
    strokeWidth: 2,
    rotation: props.chargingPoint.theta,
  })
  chargingPointGroup.add(point)
  chargingPointGroup.add(arrow)
  konvaLayer.add(chargingPointGroup)
}

/**
 * 初始化舞台
 */
function initStage() {
  if (!stageRef.value) return

  konvaStage = new Konva.Stage({
    container: stageRef.value,
    width: 0,
    height: 0,
  })
}

/**
 * 初始化地图
 */
function initialize() {
  if (!konvaStage) {
    initStage()
  }
  clearStage()
  initBackgroundImage()
}

/**
 * 更新机器人位置
 */
function updatePosition() {
  if (!konvaLayer) return
  initPos()
}

/**
 * 更新充电点位置
 */
function updateChargingPoint() {
  if (!konvaLayer) return
  initChargingPoint()
}

onMounted(() => {
  initStage()
})

// 将方法暴露给父组件
defineExpose({
  initialize,
  updatePosition,
  updateChargingPoint,
})
</script>

<style lang="scss" scoped>
.w-full {
  @apply w-full;
}
</style>
