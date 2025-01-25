import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { svgService } from "../../services/svg.service"
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { updateTask } from '../../store/actions/board.actions'
import { onTogglePicker } from '../../store/actions/app.actions'
import { MemberPicker } from '../DynamicPickers/Pickers/MemberPicker'
import { LabelPicker } from '../DynamicPickers/Pickers/LabelPicker'
import { DatePicker } from '../DynamicPickers/Pickers/DatePicker'
import { ChecklistPicker } from '../DynamicPickers/Pickers/ChecklistPicker'
import { CoverPicker } from '../DynamicPickers/Pickers/CoverPicker'
import { TaskDescription } from './TaskDescription'

const PICKERS = [
    { icon: 'joinIcon', label: 'Join', picker: null },
    { icon: 'memberIcon', label: 'Members', picker: MemberPicker },
    { icon: 'labelsIcon', label: 'Labels', picker: LabelPicker },
    { icon: 'datesIcon', label: 'Dates', picker: DatePicker },
    { icon: 'checklistIcon', label: 'Checklist', picker: ChecklistPicker },
    { icon: 'coverIcon', label: 'Cover', picker: CoverPicker },
    { icon: 'attachmentIcon', label: 'Attachment', picker: null },
    { icon: 'customFieldIcon', label: 'Custom Fields', picker: null }
]

const ACTION_BUTTONS = [
    { icon: 'rightArrowIcon', label: 'Move' },
    { icon: 'copyIcon', label: 'Copy' },
    { icon: 'cardIcon', label: 'Mirror' },
    { icon: 'templateIcon', label: 'Make template' },
    { icon: 'archiveIcon', label: 'Archive' },
    { icon: 'shareIcon', label: 'Share' }
]

export function TaskDetails() {
    const navigate = useNavigate()
    const { boardId, taskId } = useParams() // Get IDs from URL
    const board = useSelector(storeState => storeState.boardModule.board)

    // Find the task and its group
    const [currGroup, task] = React.useMemo(() => {
        if (!board?.groups) return [null, null]

        for (const group of board.groups) {
            const foundTask = group.tasks?.find(t => t.id === taskId)
            if (foundTask) {
                return [group, foundTask]
            }
        }
        return [null, null]
    }, [board, taskId])

    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editedTitle, setEditedTitle] = useState(task?.title || '')
    const [editedDescription, setEditedDescription] = useState(task?.description || '')

    const hasCover = task?.style?.coverColor ? true : false

    useEffect(() => {
        setEditedTitle(task?.title || '')
    }, [task])

    useEffect(() => {
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    function handleEscape(ev) {
        if (ev.key === 'Escape') {
            navigate(`/board/${board._id}`)
        }
    }

    function handleOverlayClick(ev) {
        if (ev.target === ev.currentTarget) {
            navigate(`/board/${board._id}`)
        }
    }

    function handleTitleKeyPress(ev) {
        if (ev.key === 'Enter') {
            ev.target.blur()
        }
        if (ev.key === 'Escape') {
            setEditedTitle(task.title)
            setIsEditingTitle(false)
        }
    }

    async function handleTaskUpdate(field, value) {
        if (!value.trim()) {
            showErrorMsg(`${field} cannot be empty`)
            return false
        }

        if (value === task[field]) {
            return true
        }

        const updatedTask = { ...task, [field]: value.trim() }

        try {
            await updateTask(board._id, currGroup.id, updatedTask)
            showSuccessMsg(`${field} updated successfully`)
            return true
        } catch (err) {
            showErrorMsg(`Failed to update ${field}`)
            return false
        }
    }

    async function handleUpdateTitle() {
        const success = await handleTaskUpdate('title', editedTitle)
        if (success) setIsEditingTitle(false)
        else setEditedTitle(task.title)
    }

    async function handleUpdateDescription(newDescription) {
        const success = await handleTaskUpdate('description', newDescription)
        if (success) setEditedDescription(newDescription)
        else setEditedDescription(task.description)
    }

    function handlePickerToggle(Picker, title, ev) {
        if (!Picker) return

        onTogglePicker({
            cmp: Picker,
            title,
            props: {
                boardId: board._id,
                groupId: currGroup.id,
                task,
                onClose: () => onTogglePicker()
            },
            triggerEl: ev.currentTarget
        })
    }

    if (!task) return <div>Loading...</div>
    return (
        <div className="task-details-overlay" onClick={handleOverlayClick}>
            <article className={`task-details ${hasCover ? 'has-cover' : ''}`}>
                {hasCover && <div className="cover" style={{ backgroundColor: task.style.coverColor }} />}

                <header className="task-header">
                    <div className="task-header-container">
                        <hgroup>
                            {isEditingTitle ? (
                                <textarea
                                    value={editedTitle}
                                    onChange={(ev) => {
                                        const textarea = ev.target
                                        textarea.style.height = 'auto'
                                        textarea.style.height = `${textarea.scrollHeight}px`
                                        setEditedTitle(ev.target.value)
                                    }}
                                    onBlur={handleUpdateTitle}
                                    onKeyDown={handleTitleKeyPress}
                                    autoFocus
                                    rows={1}
                                />
                            ) : (
                                <span onClick={() => setIsEditingTitle(true)}>{task.title}</span>
                            )}
                        </hgroup>

                        <img src={svgService.cardIcon} alt="Card Icon" className="card-icon" />

                        <div className="task-list-container">
                            <p className="list-title">
                                <span>in list</span>
                                <button>
                                    <span>
                                        {currGroup.title}
                                    </span>
                                </button>
                            </p>
                        </div>

                    </div>
                    <button className="close-btn" onClick={() => navigate(`/board/${boardId}`)}>
                        <img src={svgService.closeIcon} alt="Close" />
                    </button>
                </header>

                <main className="task-main">
                    <section className="task-content">

                        <section className="task-metadata">
                            <div className="metadata-container members">
                                <h3>Members</h3>
                                <div className="members-list">
                                    <div className="member" title="John Doe">JD</div>
                                    <div className="member" title="Sarah Smith">SS</div>
                                    <button>
                                        <img src={svgService.addIcon} alt="Add Member" />
                                    </button>
                                </div>
                            </div>

                            <div className="metadata-container labels">
                                <h3>Labels</h3>
                                <div className="labels-list">
                                    <span className="label" style={{ backgroundColor: '#61bd4f' }}>Important</span>
                                    <span className="label" style={{ backgroundColor: '#ff9f1a' }}>Urgent</span>
                                    <button>
                                        <img src={svgService.addIcon} alt="Add Label" />
                                    </button>
                                </div>
                            </div>

                            <div className="metadata-container notification">
                                <h3>Notification</h3>
                                <div className="notification-toggle" role="presentation">
                                    <button>
                                        <img src={svgService.watchIcon} alt="Watch" />
                                        <span>Watch</span>
                                    </button>
                                </div>
                            </div>

                            <div className="metadata-container due-date">
                                <h3>Due Date</h3>
                                <div className="date-info">
                                    <input type="checkbox" className="due-date-checkbox" />
                                    <button>
                                        <span>Jan 25 at 12:00 PM</span>
                                        <img src={svgService.arrowDownIcon} alt="Toggle Calender" />
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="desc">
                            <img src={svgService.descriptionIcon} alt="Description" className='desc-icon' />
                            <hgroup className="desc-header">
                                <div className="desc-controls">
                                    <h3>Description</h3>
                                    <button>Edit</button>
                                </div>
                            </hgroup>

                            <div className="desc-content">
                                <TaskDescription
                                    initialDescription={task.description}
                                    onSave={(newDescription) => handleUpdateDescription(newDescription)}
                                />
                            </div>
                        </section>

                        <section className="activity">
                            <img src={svgService.activityIcon} alt="Activity" className='activity-icon' />
                            <hgroup className="activity-header">
                                <div className="activity-controls">
                                    <h3>Activity</h3>
                                    <button>Show details</button>
                                </div>
                            </hgroup>
                            <div className="activity-item">
                                <div className="user-avatar"></div>
                                <p><span>User</span> added this card to {currGroup.title}</p>
                                <time>8 Jan 2025, 15:01</time>
                            </div>
                        </section>
                    </section>

                    <aside className="task-sidebar">
                        <ul className="features">
                            <li>
                                {PICKERS.map(({ icon, label, picker }) => (
                                    <button
                                        key={label}
                                        onClick={(ev) => handlePickerToggle(picker, label, ev)}
                                    >
                                        <img src={svgService[icon]} alt={label} />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </li>
                        </ul>

                        <ul className="actions">
                            <hgroup>
                                <h4>Actions</h4>
                            </hgroup>
                            <li>
                                {ACTION_BUTTONS.map(({ icon, label }) => (
                                    <button key={label}>
                                        <img src={svgService[icon]} alt={label} />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </li>
                        </ul>
                    </aside>
                </main>
            </article>
        </div>
    )
}