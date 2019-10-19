import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import ImageSlider from './image-slide';
import { ListItemIcon, CircularProgress, makeStyles } from '@material-ui/core';

import CheckIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

const useClasses = makeStyles(() => ({
    root: {
        width: '100%',
    },
    passed: {
        backgroundColor: 'green',
    },
    failed: {
        backgroundColor: 'red',
    }
}))

export default function SingleTestReport(props) {
    const classes = useClasses();
    const { test, runId } = props;

    const commands = (test && test.commands) || [];

    const getScreeshotResourceURL = id => `/runs/${runId}/screenshots/${id}`;

    const hasScreenshot = image => Boolean(image.afterScreenshot);

    const screenshots = commands.filter(hasScreenshot).map(({ id }) => {
        const src = getScreeshotResourceURL(id);
        return { id, src };
    });

    const toCommandComponent = command => {
        const { id, name, args, state } = command;
        const display = `${name} - ${args.join(' ')}`;

        const isRunning = Boolean(!state);
        const isPassed = state === 'passed';

        const chooseByState = ([running, passed, failed]) => (isRunning ? running : isPassed ? passed : failed);

        /* eslint-disable react/jsx-key */
        const stateAwareIcon = chooseByState([
            <CircularProgress
                variant="indeterminate"
                disableShrink
                className={classes.bottom}
                size={24}
                thickness={4}
                {...props}
            />,
            <CheckIcon color='disabled' />,
            <ErrorIcon color='error'/>,
        ]);
        /* eslint-enable react/jsx-key */

        return (
            <ListItem key={id} button divider>
                <ListItemIcon>
                    { stateAwareIcon }
                </ListItemIcon>
                <ListItemText primary={display} />
            </ListItem>
        )
    }

    return (
        <Grid container>
            <Grid className={classes.root} item md={12} lg={12}>
                <ImageSlider images={screenshots} showLoading />
            </Grid>
            <Grid className={classes.root} item md={12} lg={12}>
                <List className={classes.listRoot} dense>
                    { commands.map(toCommandComponent) }
                </List>
            </Grid>
        </Grid>
    )
}

SingleTestReport.propTypes = {
    test: PropTypes.any,
    runId: PropTypes.string,
};
