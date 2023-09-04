import React from 'react'
import Typography from '@mui/material/Typography';
import Pages from '@comp/Pages';
import DefaultLayout from '@layout/default';
import Stack from '@mui/material/Stack';
import { NAVBAR_HEIGHT } from '@layout/navbar.config';

const titleMeta = "Page Not Found – Portalnesia";
const descMeta = "The page you are looking for cannot be found anywhere.";

const Custom404 = () => {
    return (
        <Pages title={titleMeta} desc={descMeta} canonical='404'>
            <DefaultLayout withoutContainer>
                <Stack alignItems="start" justifyContent="center" minHeight={`calc(95svh - ${NAVBAR_HEIGHT}px)`}>
                <Typography variant="h1"paragraph>Page not found!</Typography>
                    <div style={{ marginTop: 16 }}>
                        <Typography variant="h4" component="p" sx={{ fontWeight: "normal" }} gutterBottom>The page you are looking for cannot be found anywhere.</Typography><Typography variant="h4" component="p" sx={{ fontWeight: "normal" }} gutterBottom>If you feel this is a mistake, please contact us at <a href="mailto:support@portalnesia.com"><span>support@portalnesia.com</span></a>.</Typography>
                    </div>
                </Stack>
            </DefaultLayout>
        </Pages>
    );
}
export default Custom404;