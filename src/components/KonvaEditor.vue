<template>
  <el-radio-group v-if="props.bgImg" v-model="mode">
    <el-radio-button v-if="hasAdd" label="新增" />
    <el-radio-button v-if="hasCharge" label="充电点" />
    <el-radio-button v-if="hasDelete" label="删除" />
    <el-radio-button v-if="hasClear" label="清空" />
    <el-radio-button v-if="hasCheck" label="校准" />
  </el-radio-group>
  <div ref="stageRef" v-loading="loading" class="w-full"></div>
</template>

<script setup lang="ts">
import Konva from "konva";
import { Group } from "konva/lib/Group";
import { Layer } from "konva/lib/Layer";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";
import { Text } from "konva/lib/shapes/Text";
import { Stage } from "konva/lib/Stage";
import { flatMapDeep, remove } from "lodash";
import { onMounted, ref, watch } from "vue";

interface Route {
  x: number;
  y: number;
}

interface CheckPoint {
  x?: number;
  y?: number;
  theta?: number;
}

interface ChargePoint {
  id?: number;
  chargeX?: number;
  chargeY?: number;
  tiltAngle?: number;
  name?: string;
}

const props = withDefaults(
  defineProps<{
    bgImg?: string;
    route?: Route[];
    hasAdd?: boolean;
    hasDelete?: boolean;
    hasClear?: boolean;
    hasCheck?: boolean;
    hasCharge?: boolean;
    checkpoint?: CheckPoint;
    chargePoint?: ChargePoint;
  }>(),
  {
    bgImg: "",
    route: () => [],
    hasAdd: false,
    hasDelete: false,
    hasClear: false,
    hasCheck: false,
    hasCharge: false,
    checkpoint: () => ({}),
    chargePoint: () => ({}),
  }
);

const emit = defineEmits([
  "update:route",
  "update:checkpoint",
  "update:chargePoint",
]);

const stageRef = ref<HTMLDivElement>(null);
const loading = ref(false);
let konvaStage: Stage;
let scale: number;
let konvaLayer: Layer;
let konvaPointGroup: Group;
let konvaLineGroup: Group;
const pointList: Shape[] = [];
const mode = ref("");
let routeScale = 1;

watch(() => props.bgImg, initBackgroundImage);

onMounted(() => {
  konvaStage = new Konva.Stage({
    container: stageRef.value,
    width: 0,
    height: 0,
  });
  initBackgroundImage(props.bgImg);
});

function initBackgroundImage(url: string) {
  routeScale = 1;
  clearStage();
  if (!url) return;
  const img = new Image();
  img.src = url;
  loading.value = true;
  img.onload = onImgLoad;
}

function onImgLoad() {
  setStageSize(this);

  const konvaImage = new Konva.Image({
    image: this,
    width: konvaStage.width(),
    height: konvaStage.height(),
  });

  initLayer(konvaImage);

  initRoute();

  initChargePoint();

  konvaStage.add(konvaLayer);

  loading.value = false;
}

function initLayer(konvaImage) {
  konvaLayer = new Konva.Layer({
    draggable: true,
    dragBoundFunc: () => ({ x: 0, y: 0 }),
  });
  konvaLineGroup = new Konva.Group();
  konvaPointGroup = new Konva.Group();

  konvaLayer.add(konvaImage);
  konvaLayer.add(konvaLineGroup);
  konvaLayer.add(konvaPointGroup);

  // konvaLayer.on("click", handleAdd);
  konvaLayer.on("wheel", layerZoom);
}

watch(mode, (val) => {
  switch (val) {
    case "新增":
      pointList.forEach((point) => point.off("click"));
      konvaLayer.on("click", handleAdd);
      break;
    case "删除":
      konvaLayer.off("click");
      pointList.forEach((point) => point.on("click", handleDelete));
      break;
    case "清空":
      konvaLayer.off("click");
      konvaPointGroup.removeChildren();
      konvaLineGroup.removeChildren();
      pointList.length = 0;
      handleDrawPath();
      break;
    case "校准":
      konvaLayer.on("click", handleCheck);
      break;
    case "充电点":
      konvaLayer.on("click", handleCharge);
  }
});

function handleAdd() {
  const mousePos = konvaLayer.getRelativePointerPosition();
  const { x, y } = mousePos;
  const point = genPoint(x, y);
  point.on("dragend", handleDrag);
  pointList.push(point);
  konvaPointGroup.add(point);
  handleDrawPath();
}

function handleDelete(e: KonvaEventObject<MouseEvent>) {
  e.target.destroy();
  remove(pointList, (point) => point === e.target);
  handleDrawPath();
}

function handleDrag() {
  handleDrawPath();
}

function handleDrawPath() {
  const points = flatMapDeep(pointList.map((point) => [point.x(), point.y()]));
  const line = new Konva.Line({
    stroke: "#f90",
    strokeWidth: routeScale,
    points,
  });
  konvaLineGroup.removeChildren();
  konvaLineGroup.add(line);
  const data = pointList.map((point) => ({
    x: point.x() / scale,
    y: point.y() / scale,
    theta: 0,
  }));
  emit("update:route", data);
}

function initRoute() {
  if (!props.route) return;
  const points = props.route || [];
  points.forEach((point) => {
    const circle = genPoint(point.x * scale, point.y * scale);
    circle.on("dragend", handleDrag);
    pointList.push(circle);
    konvaPointGroup.add(circle);
  });
  handleDrawPath();
}

function clearStage() {
  konvaStage.size({ width: 0, height: 0 });
  konvaStage.removeChildren();
  pointList.length = 0;
  mode.value = "";
}

function setStageSize(img) {
  konvaStage.width(stageRef.value.clientWidth);
  scale = konvaStage.width() / img.width;
  konvaStage.height(img.height * scale);
}

function layerZoom(e) {
  // 取消默认事件
  e.evt.preventDefault();
  handleRouteSize(e);
  // 缩放比例
  const scaleBy = 1.2;
  let newScale = konvaLayer.scaleX();
  if (e.evt.deltaY < 0) {
    newScale = newScale * scaleBy;
  } else {
    newScale = newScale / scaleBy < 1 ? 1 : newScale / scaleBy;
  }
  handleZoomCenter(newScale);
  konvaLayer.scale({ x: newScale, y: newScale });
  handleZoomOutScope();
}

function handleZoomCenter(newScale) {
  const pointerPosition = konvaLayer.getRelativePointerPosition();
  const pointXScale = pointerPosition.x / konvaStage.width();
  const pointYScale = pointerPosition.y / konvaStage.height();
  // 缩放前图层宽高
  const oldScale = konvaLayer.scaleX();
  const oldWidth = konvaStage.width() * oldScale;
  const oldHeight = konvaStage.height() * oldScale;
  // 缩放后图层宽高
  const newWidth = konvaStage.width() * newScale;
  const newHeight = konvaStage.height() * newScale;
  // 缩放后图层位置
  konvaLayer.position({
    x: konvaLayer.x() - (newWidth - oldWidth) * pointXScale,
    y: konvaLayer.y() - (newHeight - oldHeight) * pointYScale,
  });
}

// 处理缩放范围
function handleZoomOutScope() {
  const scale = konvaLayer.scaleX();
  const leftX = konvaLayer.x();
  const rightX = konvaLayer.x() + konvaStage.width() * scale;
  const topY = konvaLayer.y();
  const bottomY = konvaLayer.y() + konvaStage.height() * scale;
  if (leftX > 0) {
    konvaLayer.x(0);
  }
  if (rightX < konvaStage.width()) {
    konvaLayer.x(-(konvaStage.width() * (scale - 1)));
  }
  if (topY > 0) {
    konvaLayer.y(0);
  }
  if (bottomY < konvaStage.height()) {
    konvaLayer.y(-(konvaStage.height() * (scale - 1)));
  }
  // 处理缩放后拖拽范围
  const maxDragOffset = {
    x: -(konvaStage.width() * (scale - 1)),
    y: -(konvaStage.height() * (scale - 1)),
  };
  konvaLayer.dragBoundFunc((pos) => {
    let x = 0;
    let y = 0;
    if (pos.x > 0) {
      x = 0;
    } else if (pos.x <= maxDragOffset.x) {
      x = maxDragOffset.x;
    } else {
      x = pos.x;
    }
    if (pos.y > 0) {
      y = 0;
    } else if (pos.y <= maxDragOffset.y) {
      y = maxDragOffset.y;
    } else {
      y = pos.y;
    }
    return { x, y };
  });
}

/**
 * 校准
 */
function handleCheck() {
  konvaPointGroup.removeChildren();
  pointList.length = 0;
  const mousePos = konvaLayer.getRelativePointerPosition();
  const { x, y } = mousePos;
  const point = genPoint(x, y);
  const tr = new Konva.Transformer({
    nodes: [point],
    resizeEnabled: false,
  });
  const data = {
    x: point.x() / scale,
    y: point.y() / scale,
    theta: 0,
  };
  const text = new Konva.Text({
    x: 10,
    y: 10,
  });
  point.on("transform", () => {
    data.theta = point.rotation();
    emit("update:checkpoint", data);
    updateText(text, point);
  });
  point.on("dragmove", () => {
    data.x = point.x() / scale;
    data.y = point.y() / scale;
    emit("update:checkpoint", data);
    updateText(text, point);
  });
  updateText(text, point);
  konvaPointGroup.add(point);
  konvaPointGroup.add(tr);
  konvaPointGroup.add(text);
  pointList.push(point);
  emit("update:checkpoint", data);
}

/**
 * 生成点
 * @param x
 * @param y
 */
function genPoint(x, y) {
  return new Konva.Circle({
    x,
    y,
    radius: 5,
    fill: "#e33",
    draggable: true,
    scale: {
      x: routeScale,
      y: routeScale,
    },
  });
}

function handleRouteSize(e) {
  // 缩放比例
  const scaleBy = 1.2;
  if (e.evt.deltaY < 0) {
    routeScale = routeScale / scaleBy;
  } else {
    routeScale = routeScale * scaleBy > 1 ? 1 : routeScale * scaleBy;
  }
  if (pointList.length === 0) return;
  pointList.forEach((point) => {
    point.scale({ x: routeScale, y: routeScale });
  });
  // const line = konvaLineGroup.getChildren()[0] as Line;
  // line.strokeWidth(routeScale);
}

function handleCharge() {
  konvaPointGroup.removeChildren();
  pointList.length = 0;
  const mousePos = konvaLayer.getRelativePointerPosition();
  const { x, y } = mousePos;
  const point = genPoint(x, y);
  const tr = new Konva.Transformer({
    nodes: [point],
    resizeEnabled: false,
  });
  const data = {
    id: props.chargePoint.id,
    chargeX: x / scale,
    chargeY: y / scale,
    tiltAngle: 0,
  };
  const text = new Konva.Text({
    x: 10,
    y: 10,
  });
  point.on("transform", () => {
    data.tiltAngle = point.rotation();
    emit("update:chargePoint", data);
    updateText(text, point);
  });
  point.on("dragmove", () => {
    data.chargeX = point.x() / scale;
    data.chargeY = point.y() / scale;
    emit("update:chargePoint", data);
    updateText(text, point);
  });
  updateText(text, point);
  konvaPointGroup.add(point);
  konvaPointGroup.add(tr);
  konvaPointGroup.add(text);
  pointList.push(point);
  emit("update:chargePoint", data);
}

function updateText(text: Text, point: Shape) {
  const lines = [
    `x: ${point.x() / scale}`,
    `y: ${point.y() / scale}`,
    `角度: ${point.rotation()}`,
  ];
  text.text(lines.join("\n\n"));
}

function initChargePoint() {
  if (!props.chargePoint || !props.chargePoint.name) return;
  const point = genPoint(
    props.chargePoint.chargeX * scale,
    props.chargePoint.chargeY * scale
  );
  point.rotation(props.chargePoint.tiltAngle);
  const tr = new Konva.Transformer({
    nodes: [point],
    resizeEnabled: false,
  });
  const data = {
    id: props.chargePoint.id,
    chargeX: point.x() / scale,
    chargeY: point.y() / scale,
    tiltAngle: 0,
  };
  const text = new Konva.Text({
    x: 10,
    y: 10,
  });
  point.on("transform", () => {
    data.tiltAngle = point.rotation();
    emit("update:chargePoint", data);
    updateText(text, point);
  });
  point.on("dragmove", () => {
    emit("update:chargePoint", data);
    updateText(text, point);
  });
  updateText(text, point);
  konvaPointGroup.add(point);
  konvaPointGroup.add(tr);
  konvaPointGroup.add(text);
  pointList.push(point);
}
</script>
