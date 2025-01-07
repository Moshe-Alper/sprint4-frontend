import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { boardService } from '../services/board'
import { userService } from '../services/user'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { loadBoard, addBoardMsg, addGroup, updateGroup, loadGroups } from '../store/actions/board.actions'

import { BoardGroup } from '../cmps/BoardGroup'

export function BoardDetails() {

    const { boardId } = useParams()
    const board = useSelector(storeState => storeState.boardModule.board)
    const groups = useSelector(storeState => storeState.boardModule.groups)

    useEffect(() => {
        loadBoard(boardId)
    }, [boardId])


    async function onAddBoardMsg(boardId) {
        try {
            await addBoardMsg(boardId, 'bla bla ' + parseInt(Math.random() * 10))
            showSuccessMsg(`Board msg added`)
        } catch (err) {
            showErrorMsg('Cannot add board msg')
        }

    }

    async function onAddGroup(boardId) {
        const group = boardService.getEmptyGroup()
        group.title = 'Group ' + Math.floor(Math.random() * 100)
        try {
            await addGroup(boardId, group)
            loadBoard(board._id)
            showSuccessMsg(`Group added (id: ${group.id})`)
        } catch (err) {
            console.log('Cannot add group', err)
            showErrorMsg('Cannot add group')
        }
    }

    async function onUpdateGroup(group) {
        const title = prompt('New title?', group.title)
        if (!title || !title.trim()) return alert('Invalid title')    
        const groupToSave = { ...group, title: title.trim() }
        try {
            const savedGroup = await updateGroup(board._id, groupToSave)
            loadBoard(board._id)
            showSuccessMsg(`Group updated, new title: ${savedGroup.title}`)
        } catch (err) {
            showErrorMsg('Cannot update group')
        }
    }

    
    if (!board) return <div>Loading...</div>
    // console.log('🚀 board', board)
    
    return (
        <section className="board-details">            
            {/* <Link to="/board">Back to list</Link> */}
            {board && <div>
                <section className="group-container flex">
                {board.groups.map(group => (
                    <BoardGroup
                    key={group.id}
                    board={board}
                    group={group}
                    onUpdateGroup={onUpdateGroup}
                    />
                ))}
                {userService.getLoggedinUser() && <button className="add-list-btn" onClick={() => { onAddGroup(board._id) }}>Add another list</button>}
                </section>
                <pre> {JSON.stringify(board, null, 2)} </pre>
            </div>
            }
            <button onClick={() => { onAddBoardMsg(board._id) }}>Add board msg</button>

        </section>
    )
}