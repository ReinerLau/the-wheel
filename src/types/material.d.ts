export interface Material {
  /**
   * 物资ID
   */
  id: number
  /**
   * 物资编号
   */
  materialCode: string
  /**
   * 库房ID
   */
  warehouseId: number
  /**
   * 物资名称
   */
  materialName: string
  /**
   * 物资分类
   */
  categoryName: string
  /**
   * 供应商
   */
  supplier: string
  /**
   * 计量单位
   */
  unit: string
  /**
   * 生产日期
   */
  productionDate: string
  /**
   * 物资数量
   */
  materialCount: number
  /**
   * 库房名称
   */
  warehouseName: string
  /**
   * 货架存储信息
   */
  store: Shelf &
    {
      /**
       * 物资在当前货架上的数量
       */
      count: number
    }[]
}
