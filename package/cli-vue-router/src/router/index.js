
import { createRouter <%if (historyMode){%>,createWebHistory<%
}else {%>,
    createWebHashHistory<%
}%>} from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home',
        component: ()=>import('./views/home.vue')
    },
]

const router = createRouter({
<%_ if (historyMode) { _%>
history: createWebHistory(process.env.BASE_URL),
    <%_ } else { _%>
history: createWebHashHistory(),
    <%_ } _%>
routes
})

export default router
