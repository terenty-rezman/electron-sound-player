import React from 'react'

import './PageDisplay.css'

const PageDisplay = ({ children, page }) => {

    const pages = React.Children.map(children, (child, index) => {
        let classStr = child.props.className;

        if(index !== page)
            classStr += ' page-hidden';
        else
            classStr += ' page-shown';

        return React.cloneElement(child, {className: classStr});
    });

    return (
        pages
    )
}

export default PageDisplay