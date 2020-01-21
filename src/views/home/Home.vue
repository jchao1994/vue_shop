<template>
  <div id="home">
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div class="home-header-brand">
          <img src="~assets/img/home/brand.jpg" alt />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside width="elAsideWidth">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏菜单区域 -->
          <el-menu 
          background-color="#333744" 
          text-color="#fff" 
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
              <!-- 一级菜单的模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template>

              <!-- 二级菜单 -->
              <el-menu-item 
              :index="'/' + subItem.path" 
              v-for="subItem in item.children" 
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)">
                <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{ subItem.authName }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容主体 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { getMenuList } from "network/home";

export default {
  name: "Home",
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-icon-shangpin',
        '102': 'iconfont icon-icon-danju-tianchong',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },

    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath;
    }
  },
  computed: {
    elAsideWidth() {
      return isCollapse ? '64px' : '200px'
    }
  },
  async created() {
    const res = await getMenuList();
    if (res.meta.status !== 200) {
      return this.$message.error(res.meta.msg);
    } else {
      this.menuList = res.data;
    }

    this.activePath = window.sessionStorage.getItem('activePath');

  }
};
</script>

<style scoped>
#home,
.home-container {
  height: 100%;
}


.el-menu {
  border-right: none;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  justify-items: center;
  padding: 5px;
  color: #fff;
  font-size: 20px;
}

.home-header-brand {
  display: flex;
  align-items: center;
}

.home-header-brand img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.home-header-brand span {
  margin-left: 15px;
}

.el-header .el-button {
  margin: 5px 5px 5px 0;
}

.el-aside {
  background-color: #333744;
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px
}

.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>