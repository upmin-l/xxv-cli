



<%_ if (useEarth) { _%>
//地图初始化
export function initMap() {
        return new Promise((resolve, reject) => {
            try {
                const app = (uino.app = new THING.App())
                // 创建地球
                uino.map = app.create({
                    type: 'Map',
                    url: '/map/map.json',
                    attribution: 'none',
                    resourceConfig: {
                        // maximumLevel: 18,
                        // TODO：这里不加最后的斜线vite会报错
                        resourcePrefix: '/map/', // 资源路径前缀
                    },
                    complete: () => {
                        resolve(app)
                    },
                })
            } catch (e) {
                reject(e)
            }
        })
    }
<%_ } %>

