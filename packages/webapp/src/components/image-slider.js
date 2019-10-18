import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
// import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import CircularProgress from '@material-ui/core/CircularProgress';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
// import { Toolbar } from '@material-ui/core';

const useStyles = makeStyles({
    container: {
        position: 'relative',
        maxWidth: 900,
        width: '100%',
        height: 400,
        overflow: 'hidden',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'lightgray',
        borderStyle: 'solid',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#282a36',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    arrow: props => ({
        position: 'absolute',
        top: '50%',
        transform: 'translate(0, -50%)',
        display: props.images.length > 1 ? 'block' : 'hidden',
    }),
    arrowLeft: {
        left: 10,
    },
    arrowRight: {
        right: 10,
    },
    hidden: {
        display: 'none',
    },
});

function Arrow(props) {
    let { right, ...rest } = props;

    const ArrowIcon = right ? ChevronRight : ChevronLeft;

    return (
        <Fab {...rest}>
            <ArrowIcon />
        </Fab>
    )   
}

Arrow.defaultProps = {
    right: false,
    color: 'primary',
    onClick: () => {},
}

Arrow.propTypes = {
    left: PropTypes.bool,
    right: PropTypes.bool,
    onClick: PropTypes.func,
    color: PropTypes.oneOf(['primary', 'secondary', 'default', 'inherit']),
}

export default function ImageSlide(props) {
    const { images } = props;
    const classes = useStyles(props);

    const [index, setIndex] = useState(0);


    const imageList = images.map((data, i) => {
        const className = i === index ? classes.image : classes.hidden;

        return <img key={data.id} className={className} src={data.src} alt='alt' />
    });

    const maxIndex = imageList.length - 1;

    const prev = () => {
        if (index === 0) return;
        setIndex(index - 1);
    }

    const next = () => {
        if (index === maxIndex) return;
        setIndex(index + 1);
    }

    const content = (!imageList.length && props.showLoading) 
        ? <CircularProgress className={classes.progress} />
        : imageList

    return (
        <div>
            <div className={classes.container}>
                <Arrow size="small" color="primary" aria-label="left" className={`${classes.arrow} ${classes.arrowLeft}`} onClick={prev} />
                <Arrow size="small" color="primary" aria-label="right" className={`${classes.arrow} ${classes.arrowRight}`} onClick={next} right />
                { content  }
            </div>
        </div>
    );
}

ImageSlide.defaultProps = {
    images: [],
    showLoading: false,
}

ImageSlide.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            src: PropTypes.string,
        })
    ),
    showLoading: PropTypes.bool
}
