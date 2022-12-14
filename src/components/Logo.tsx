//import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import SvgIcon from '@mui/material/SvgIcon';
import { Theme, useTheme,SxProps } from "@mui/material/styles";
import { SystemCssProperties } from '@mui/system/styleFunctionSx';
import {A} from '@design/components/Dom'

interface SvgProps {
  size?:SystemCssProperties<Theme>['fontSize']
}

export interface LogoProps {
    href?:string|false
    svg?:SvgProps
    sx?: SxProps<Theme>
}

function SvgLogo({size}: SvgProps) {
  const theme = useTheme();
  return (
    <SvgIcon {...(size ? {sx:{fontSize:size}} : {})} width="655.000000pt" height="665.000000pt" viewBox="0 0 655.000000 665.000000"
    preserveAspectRatio="xMidYMid meet">
      <g transform="translate(0.000000,665.000000) scale(0.100000,-0.100000)"
      fill={theme.palette.customColor.linkIcon} stroke="none">
      <path d="M1167 6594 c-172 -37 -313 -112 -432 -229 -93 -90 -150 -180 -192
      -300 l-28 -80 -3 -2968 -2 -2967 495 0 495 0 0 2780 0 2780 533 0 532 0 130
      -158 c107 -129 900 -1084 1258 -1514 49 -60 95 -108 103 -108 12 0 14 138 14
      895 l0 896 308 -3 308 -3 59 -35 c85 -50 174 -142 217 -226 71 -135 68 -63 68
      -1426 0 -852 -3 -1243 -11 -1280 -6 -29 -27 -87 -46 -128 -44 -93 -157 -209
      -249 -258 l-62 -32 -263 0 -264 0 -104 113 c-917 986 -1547 1657 -1558 1657
      -11 0 -13 -247 -13 -1380 l0 -1380 1418 0 c1531 1 1492 -1 1637 54 255 97 428
      301 485 571 21 100 21 103 18 2155 l-3 2055 -38 79 c-111 233 -297 383 -547
      441 -97 22 -4159 21 -4263 -1z"/>
      </g>
    </SvgIcon>
  )
}

export default function Logo({href='/',svg,sx}: LogoProps) {
    // const theme = useTheme();
    if(typeof href==='boolean') return <SvgLogo />
    return (
      <Link href={href} passHref legacyBehavior><A sx={{height:'100%',display:'inline-flex',...sx}}>
        <SvgLogo {...svg} />
      </A></Link>
    );
}