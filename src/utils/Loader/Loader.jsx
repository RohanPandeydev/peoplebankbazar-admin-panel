import React from 'react'
import './loader.css'
import { ColorRing } from 'react-loader-spinner'
const Loader = () => {
  return (
    <div className="spinner-box">

      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="color-ring-loading"
        wrapperStyle={{}}
        wrapperclassName="color-ring-wrapper"
        colors={['#eac92c', '#000000']}
      />

    </div>

  )
}

export default Loader