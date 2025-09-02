export interface Warehouse {
  /**
   * 仓库ID
   */
  id: number
  /**
   * 仓库名称
   */
  name: string
  /**
   * 仓库建设时间
   */
  constructionTime: string
  /**
   * 仓库建筑面积
   */
  buildingArea: number
  /**
   * 仓库举架高度
   */
  ceilingHeight: number
  /**
   * 仓库引洞长度
   */
  tunnelLength: number
  /**
   * 仓库货架数量
   */
  shelveCount: number
  /**
   * 仓库物资数量
   */
  materialCount: number
}
