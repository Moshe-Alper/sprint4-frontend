import React from 'react'

export function BoardGroupFooter({ isAddingTask, setIsAddingTask, newTaskTitle, handleTitleChange, handleAddTask }) {
    return (
        <footer className="board-group-footer">
            {isAddingTask ? (
                <form className="add-task-container" onSubmit={handleAddTask}>
                    <input
                        type="text"
                        placeholder="Enter task title or paste a link"
                        value={newTaskTitle} // Bind to newTaskTitle
                        onChange={handleTitleChange} // Correct function for value change
                    />
                    <div className="buttons-container">
                        <button type="submit" className="add-card-btn">Add a card</button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => setIsAddingTask(false)}
                        >
                            x
                        </button>
                    </div>
                </form>
            ) : (
                <button className="add-list-btn" onClick={() => setIsAddingTask(true)}>
                    Add a card
                </button>
            )}
        </footer>
    )
}
