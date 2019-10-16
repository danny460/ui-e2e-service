import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Navbar = styled.div`
    width: 100vw;
    display: flex;
    flex-direction: row-reverse;
`;

const NavLink = styled.a`
    flex-grow: 1;
`;

export default class Header extends React.Component {
    render() {
        const links = this.props.links.map(config => {
            const { display, href, /*action*/ } = config;

            return (<NavLink key={display} href={href}>{display}</NavLink>);
        })

        return <Navbar> {links} </Navbar>;
    }
}

Header.propTypes = {
    links: PropTypes.arrayOf(PropTypes.any)
}
