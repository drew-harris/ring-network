import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/simulator/messages/')({
  component: () => <div>Hello /simulator/messages/!</div>
})