
import { createRouter <%
if (historyMode){%>,
    createWebHistory<%
}else {%>,
    createWebHashHistory<%
}%>} from 'vue-router'

