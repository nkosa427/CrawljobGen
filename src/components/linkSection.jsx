import React from "react";

const LinkSection = (props) => {

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
          <button>Remove</button>
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