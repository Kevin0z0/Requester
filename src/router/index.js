import { createRouter, createWebHashHistory  } from 'vue-router'
import Dashboard from '../views/Dashboard'
import Request from '../views/Request'

const routes = [
	{
		path: '/',
		name: 'Dashboard',
		component: Dashboard,
		meta: {
			keepAlive: false
		}
	},
	{
		path: '/request',
		name: 'Request',
		component: Request,
		meta: {
			keepAlive: true
		}
	},
	{
		path: '/environment',
		name: 'Environment',
		component: () => import('../views/Environment.vue')
	},
	{
		path: '/collections',
		name: 'Collection',
		component: () => import('../views/Collection.vue')
	},
	{
		path: '/teams',
		name: 'Teams',
		component: () => import('../views/Teams.vue')
	},
]
// aaa
// console.log(``)
const router = createRouter({
	// Cannot use general mode
	// when window reload in production mode
	// app will show nothing
	history: createWebHashHistory (),
	routes
})

export default router
