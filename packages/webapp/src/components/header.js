import React from 'react';
// import styled from 'styled-components';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 5,
    },
    link: {
        flexGrow: 1,
        color: 'white',
    }
}));

export default function Header() {
    const classes = useStyles();
    
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>Title</Typography>
                    <Link className={classes.link} href='' onClick={() => {}}>Link A</Link>
                    <Link className={classes.link} href='' onClick={() => {}}>Link B</Link>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>
        </div>
    )
}

Header.propTypes = {
    links: PropTypes.arrayOf(PropTypes.any)
}
