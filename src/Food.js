import React from 'react';

const Food = (props) => {
    const style = {
        left: `${props.food[0]}%`,
        top: `${props.food[1]}%`
    }

    return (
        <div className='food-dot' style={style}>
            <div className='food-geen'></div>
        </div>
    )
}
export default Food;