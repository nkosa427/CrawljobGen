import React from "react";

const LinkSection = (props) => {

  const handleEdit = (link) => {

  }

  const handleDelete = (link, path) => {
    props.handleDelete(link, path)
  }

  const linkSection = (
    props.links.map((link, index) => {
      return (
        <div key={index}>
          <input 
            className='linkInput'
            value={link} 
            disabled={true}
          />
          <button>Edit</button>
          <button onClick={() => handleDelete(link, props.path)}>Remove</button>
        </div>
      )
    })
  )

  return (
    <div>
      {linkSection.reverse()}
    </div>
  )
}

export default LinkSection