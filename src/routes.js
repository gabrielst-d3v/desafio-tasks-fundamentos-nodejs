import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from "./utils/build-route-path.js"
import { title } from 'node:process'

const database = new Database()

export const routes = [
	{
		method: 'GET',
		path: buildRoutePath('/tasks'),
		handler: (req, res) => {
			const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)

      return res.end(JSON.stringify(tasks))
		}
	},
	{
		method: 'POST',
		path: buildRoutePath('/tasks'),
		handler: (req, res) => {
			const { title, description } = req.body

			if (!title) {
				return res.writeHead(400).end(JSON.stringify({ message: 'Title is required' }))
			}
			
			if (!description) {
				return res.writeHead(400).end(JSON.stringify({ message: 'Description is required' }))
			}

      const task = {
        id: randomUUID(),
        title,
        description,
				completed_at: null,
				created_at: new Date(),
				updated_at: new Date(),
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
		}
	},
	{
		method: 'PUT',
		path: buildRoutePath('/tasks/:id'),
		handler: (req, res) => {
			const { id } = req.params
			const { title, description } = req.body

			if (!title || !description) {
				return res.writeHead(400).end(JSON.stringify({ message: 'Title or description is required' }))
			}

			const [task] = database.select('tasks', { id })

			if (!task) {
				return res.writeHead(404).end(JSON.stringify({ message: 'Task not found' }))
			}

			database.update('tasks', id, {
				title,
				description,
				completed_at: task.completed_at,
				created_at: task.created_at,
				updated_at: new Date()
			})
   
      return res.writeHead(204).end()
		}
	},
	{
		method: 'DELETE',
		path: buildRoutePath('/tasks/:id'),
		handler: (req, res) => {
			const { id } = req.params

			const [task] = database.select('tasks', { id })

			if (!task) {
				return res.writeHead(404).end(JSON.stringify({ message: 'Task not found' }))
			}

      database.delete('tasks', id)
      
      return res.writeHead(204).end()
		}
	},
	{
		method: 'PATCH',
		path: buildRoutePath('/tasks/:id/complete'),
		handler: (req, res) => {
			const { id } = req.params

			const [task] = database.select('tasks', { id })

			if (!task) {
				return res.writeHead(404).end(JSON.stringify({ message: 'Task not found' }))
			}

			const isTaskCompleted = !!task.completed_at
			const completed_at = isTaskCompleted ? null : new Date()

			database.update('tasks', id, {
				title: task.title,
				description: task.description,
				completed_at,
				updated_at: task.updated_at,
				created_at: task.created_at,
			})

			return res.writeHead(204).end()
		}
	}
]