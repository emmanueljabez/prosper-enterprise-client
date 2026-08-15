import type {
  CompanyWalkthroughTask,
  CompanyWalkthroughTaskId,
  CompanyWalkthroughTourId,
} from '@/types/company-walkthrough'

type ProgressionTask = Pick<CompanyWalkthroughTask, 'id' | 'tourId' | 'route'>

export const resolveNextCompanyWalkthroughTask = (
  tasks: ProgressionTask[],
  completedTaskIds: Iterable<CompanyWalkthroughTaskId | string>,
  finishedTourId: CompanyWalkthroughTourId,
) => {
  if (!tasks.length) {
    return null
  }

  const completedIds = new Set(completedTaskIds)
  const currentIndex = tasks.findIndex(task => task.tourId === finishedTourId)
  const orderedTasks = currentIndex >= 0
    ? [...tasks.slice(currentIndex + 1), ...tasks.slice(0, currentIndex + 1)]
    : tasks

  return orderedTasks.find(task => !completedIds.has(task.id)) || null
}
