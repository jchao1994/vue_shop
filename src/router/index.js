import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import('views/login/Login')
const Home = () => import('views/home/Home')
const Welcome = () => import('views/home/childComps/Welcome')
const Users = () => import('views/home/childComps/Users')
const Rights = () => import('views/home/childComps/Rights')
const Roles = () => import('views/home/childComps/Roles')
const Categories = () => import('views/home/childComps/Categories')
const Params = () => import('views/home/childComps/Params')
const Goods = () => import('views/home/childComps/Goods')
const AddGoods = () => import('views/home/childComps/AddGoods')
const EditGoods = () => import('views/home/childComps/EditGoods')
const Orders = () => import('views/home/childComps/Orders')

Vue.use(VueRouter)
  
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods,
      },
      {
        path: '/goods/add',
        component: AddGoods
      },
      {
        // URL中不显示参数，但是一旦刷新参数就会消失
        name: 'EditGoods',
        path: '/goods/edit',
        component: EditGoods
      },
      {
        path: '/orders',
        component: Orders
      }
    ]
  }
]

const router = new VueRouter({
  routes,
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) {
    return next('/login');
  } else {
    next();
  }
})

export default router