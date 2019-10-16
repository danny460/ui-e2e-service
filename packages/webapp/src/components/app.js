import React, { Fragment } from 'react';

import Header from './header';
import IDE from './ide';

const linkConfigs = [
    {
        display: 'Link A',
        href: '/linkA',
    },
    {
        display: 'Link B',
        href: '/linkB',
    },
];

export default class App extends React.Component {
    render() {
        return (
            <Fragment>
                <Header links={linkConfigs} />
                <IDE />
            </Fragment>
        );
    }
}
