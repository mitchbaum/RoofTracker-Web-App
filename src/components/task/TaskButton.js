import React from 'react'
import PropTypes from 'prop-types'

const TaskButton = ({color, text, onClick}) => {
 
  return (
    <button onClick={onClick} style={{backgroundColor: color}} className='status-btn security-access' style={{margin: '0', width: '110px'}}>{text}</button>
  )
}

TaskButton.defaultProps = {
    color: 'steelBlue',
    text: 'Add'
}

TaskButton.propTypes = {
    text: PropTypes.string,
    color: PropTypes.string,
    onClick: PropTypes.func
}

export default TaskButton