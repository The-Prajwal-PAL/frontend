import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { toast } from 'sonner'
import plus from '../../../assets/plus.svg'
import {
  useEditTodoMutation,
  useParticularTodoQuery,
  useGetAllTodosQuery,
} from '../../../store/api/todoapi'
import { Button, PriorityHolder, TaskInput } from '../../index'
import '../InputModal/inputModal.css'
import { formatDate } from '../../../utils/InputTaskUtilities'
const EditModal = ({ closeModal, closeDots, _id }) => {
  const { refetch } = useGetAllTodosQuery()
  const { data, isSuccess } = useParticularTodoQuery(_id)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [cal, setCal] = useState(false)
  const [priority, setPriority] = useState('')
  const [tasks, setTasks] = useState([])
  const [label, setLabel] = useState('')
  const [editTodo, { isLoading, isError, isSuccess: updatedTodos }] =
    useEditTodoMutation()
  useEffect(() => {
    if (isSuccess) {
      setTitle(data.todo.title)
      setDate(new Date(data.todo.date))
      setTasks([...data.todo.tasks])
      setPriority(data.todo.priority)
      setLabel(data.todo.label)
    }
  }, [isSuccess, data])
  const submitHandler = async () => {
    const nonEmpty = tasks.filter(task => task.title != "")
    if(nonEmpty.length===0) return toast.error('Tasks are mandatory!') 
    try {
      const response = await editTodo({
        title: title,
        priority: priority,
        date: date,
        tasks: [...nonEmpty],
        label: label,
        taskId: _id,
      })
      if (response.error) {
        return toast.error(`${response.error.data.message}`)
      }
      refetch()
      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }
  const handleDateChange = (newDate) => {
    setDate(newDate)
    setCal(false)
  }
  const addNewTask = () => {
    setTasks([...tasks, { title: '', completed: false }])
  }
  const deleteTask = (index) => {
    const updatedTasks = [...tasks]
    updatedTasks.splice(index, 1)
    setTasks(updatedTasks)
  }
  const handleTaskTitle = (index, newText) => {
    const updatedTasks = [...tasks]
    updatedTasks[index] = {
      ...updatedTasks[index],
      title: newText,
    }

    setTasks(updatedTasks)
  }
  const handleTaskCompletion = (index) => {
    const updatedTasks = [...tasks]
    const checkbool = updatedTasks[index].completed
    updatedTasks[index] = { ...updatedTasks[index], completed: !checkbool }
    setTasks(updatedTasks)
  }
  const done = tasks.reduce((acc, curr) => {
    acc += curr.completed ? 1 : 0
    return acc
  }, 0)
  return (
    <div className="relative">
      <div
        className="input-m-container "
        style={{
          zIndex: 10000,
        }}
      >
        <div className="add-new-content">
          <div className="title-m">
            <h2>Title</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="Enter Task Title"
            />
          </div>
          <div className="priority-m">
            <h2>Select Priority</h2>
            <div className="priority-labels">
              <PriorityHolder
                setPriority={setPriority}
                priority={priority}
              >
                HIGH
              </PriorityHolder>
              <PriorityHolder
                setPriority={setPriority}
                priority={priority}
              >
                MODERATE
              </PriorityHolder>
              <PriorityHolder
                setPriority={setPriority}
                priority={priority}
              >
                LOW
              </PriorityHolder>
            </div>
          </div>
          <h2 className="checklist-m">
            Checklist ({`${done}/${tasks.length}`})
          </h2>

          {tasks.length != 0 ? (
            <div className="scrollable-m">
              <div className="input-holder">
                {tasks.map((task, index) => {
                  return (
                    <TaskInput
                      key={task._id}
                      value={task.title}
                      completed={task.completed}
                      setValue={(ans) => handleTaskTitle(index, ans)}
                      setComplete={() => handleTaskCompletion(index)}
                      deleteTask={() => deleteTask(index)}
                    />
                  )
                })}
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="addNew">
            <div
              className="addNew-button"
              onClick={addNewTask}
            >
              <img src={plus} />
              <h3>Add New</h3>
            </div>
          </div>
        </div>
        <div className="buttons-m">
          <Button
            onclick={() => setCal(true)}
            text={date ? formatDate(date) : 'Select Due Date'}
            width="185px"
            border="1px solid #e2e2e2"
            color="#707070"
            bg="none"
          ></Button>
          {cal && (
            <Calendar
              value={date}
              onChange={handleDateChange}
              className="calendar"
            />
          )}
          <div className="down-m-button">
            <Button
              text="Cancel"
              onclick={() => {
                closeModal()
                closeDots()
              }}
              width="162.5px"
              bg={'#ffffff'}
              border={'1px solid #cf3636'}
              color="#cf3636"
            ></Button>
            <Button
              onclick={() => {
                submitHandler()
                closeModal()
                closeDots()
              }}
              text="Save"
              width="162.5px"
              bg="#17a2bb"
              border="none"
              color="#ffffff"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { EditModal }
