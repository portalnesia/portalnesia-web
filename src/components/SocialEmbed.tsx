import { FacebookEmbed, FacebookEmbedProps, InstagramEmbed, TikTokEmbed, TwitterEmbed } from 'react-social-media-embed';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

export interface SocialEmbedProps extends Pick<FacebookEmbedProps,'url'|'width'> {
    type: 'facebook'|'instagram'|'twitter'|'tiktok'
}

export default function SocialEmbed({url,width=500,type}: SocialEmbedProps) {
    const theme = useTheme();

    return (
        <Box display='flex' justifyContent='center'my={3} width="100%">
            {type === "twitter" ? (
                <TwitterEmbed url={url} width="100%" style={{maxWidth:width}} twitterTweetEmbedProps={{options:{theme:theme.palette.mode === 'dark' ? 'dark' : 'light'}}} />
            ) : type === "instagram" ? (
                <InstagramEmbed url={url} width="100%" style={{maxWidth:width}} />
            ) : type === "tiktok" ? (
                <TikTokEmbed url={url} width="100%" style={{maxWidth:width}} />
            ) : type === "facebook" ? (
                <FacebookEmbed url={url} width="100%" style={{maxWidth:width}} />
            ) : null}
        </Box>
    )
}