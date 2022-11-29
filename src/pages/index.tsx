import React from "react";
import DefaultLayout from "@layout/default/index";
import Box,{BoxProps} from "@mui/material/Box";
import SvgInformation from "@comp/svg/information";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Pages from "@comp/Pages";

export default function Index() {

    return (
        <Pages>
            <DefaultLayout maxWidth={false} withoutContainer>
                <FirstSection />

            </DefaultLayout>
        </Pages>
    )
}

function Section({children,...props}: BoxProps) {

    return (
        <Box minHeight='95vh' width='100%' {...props}>
            <Container sx={{py:5}}>
                {children}
            </Container>
        </Box>
    )
}

function FirstSection() {
    return (
        <Section bgcolor='background.paper' display='flex' justifyContent='center' alignItems='center'>
            <Grid sx={{textAlign:'center'}} container justifyContent='center'>
                <Grid item xs={6} lg={8}>
                    <SvgInformation size={250} />
                    <Typography paragraph variant='h3'>The Future Platform</Typography>
                    <Typography variant='h5' sx={{fontWeight:'normal'}}>A multi-functional website to accompany you to surf the internet. Sign up to get more features.</Typography>
                </Grid>
            </Grid>
        </Section>
    )
}