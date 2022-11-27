import SvgIcon from '@mui/material/SvgIcon'
import { Theme,useTheme } from "@mui/material/styles";
import { SystemCssProperties } from '@mui/system/styleFunctionSx';

export default function SvgInformation({size}: {size?:SystemCssProperties<Theme>['fontSize']}) {
    const theme = useTheme();
    return (
        <SvgIcon {...(size ? {sx:{fontSize:size}} : {})} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
            <defs>
                <clipPath id="a">
                <path
                    fill={theme.palette.divider}
                    stroke="#637381"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M348.42 301.82L57.62 320.19 57.62 80.08 348.42 96.12 348.42 301.82z"
                />
                </clipPath>
            </defs>
            <path
                d="M479.58 213.15c-1-6.19-2.19-12.27-3.49-18.19C465.49 146.77 441 95.64 393 76.18 337.78 53.8 259.4 60 210 103.71c-38 33.6-115 53.88-158 104.82-44.57 52.81-53.88 151.78 4 191.73 41.17 28.41 92.07 6 137.92-3.39 26.11-5.34 48.71-2.32 74.45 0 44.73 4 91.06 7 136.17-3 22.28-5 42.09-14.06 54.65-34.72 26.38-43.45 28.2-98.15 20.39-146z"
                fill="#92e3a9"
            />
            <path
                d="M479.58 213.15c-1-6.19-2.19-12.27-3.49-18.19C465.49 146.77 441 95.64 393 76.18 337.78 53.8 259.4 60 210 103.71c-38 33.6-115 53.88-158 104.82-44.57 52.81-53.88 151.78 4 191.73 41.17 28.41 92.07 6 137.92-3.39 26.11-5.34 48.71-2.32 74.45 0 44.73 4 91.06 7 136.17-3 22.28-5 42.09-14.06 54.65-34.72 26.38-43.45 28.2-98.15 20.39-146z"
                fill="#fff"
                opacity={0.7000000000000001}
            />
            <path
                d="M49 323h54a6 6 0 016 6h0a6 6 0 01-6 6H42a6 6 0 01-6-6h0a6 6 0 016-6h1.5M91 342.85h12a6 6 0 016 6h0a6 6 0 01-6 6H42a6 6 0 01-6-6h0a6 6 0 016-6h43.5M103 374.71H42a6 6 0 01-6-6h0a6 6 0 016-6h61a6 6 0 016 6h0a6 6 0 01-6 6z"
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M85.5 303L116 303 116 385.5 75.5 385.5"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M42.5 385.5L29.5 385.5 29.5 303 78.5 303"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M68.5 385.5L47.5 385.5"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M34 315L111 315"
            />
            <path
                d="M125 54.15h54a6 6 0 016 6h0a6 6 0 01-6 6h-61a6 6 0 01-6-6h0a6 6 0 016-6h1.5M167 74h12a6 6 0 016 6h0a6 6 0 01-6 6h-61a6 6 0 01-6-6h0a6 6 0 016-6h43.5"
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
            />
            <rect
                x={112}
                y={93.85}
                width={73}
                height={12}
                rx={6}
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M161.5 34.15L192 34.15 192 116.65 151.5 116.65"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M118.5 116.65L105.5 116.65 105.5 34.15 154.5 34.15"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M144.5 116.65L123.5 116.65"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M110 46.15L187 46.15"
            />
            <path
                d="M376.05 73.33h-31.53a2.41 2.41 0 01-2.41-2.41v-9.16a2.41 2.41 0 012.41-2.41h42.25a2.41 2.41 0 012.41 2.41v3.59"
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
            />
            <path
                d="M375.75 88.23V68.64a3.15 3.15 0 013.14-3.14h41.84a3.15 3.15 0 013.14 3.14V92.1M423.87 111.42v24.44a3.15 3.15 0 01-3.14 3.14h-41.84a3.15 3.15 0 01-3.14-3.14V92.93"
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M378.72 76.95L420.87 76.95"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M398.86 89.66L420.87 89.66"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M378.72 89.66L395.42 89.66"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M378.72 102.37L420.87 102.37"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M413.32 115.08L420.87 115.08"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M378.72 115.08L409.52 115.08"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M378.72 127.8L420.87 127.8"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M350.62 66.02L373.59 66.02"
            />
            <path
                d="M214.1 356.18h-43.46a3.33 3.33 0 01-3.33-3.32v-12.63a3.33 3.33 0 013.33-3.33h58.23a3.33 3.33 0 013.33 3.33v4.95"
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
            />
            <path
                d="M213.69 376.73v-27a4.33 4.33 0 014.33-4.33h57.67a4.33 4.33 0 014.33 4.33v32.35M280 408.69v33.69a4.33 4.33 0 01-4.33 4.33H218a4.33 4.33 0 01-4.33-4.33V383.2"
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M217.78 361.17L275.89 361.17"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M245.54 378.69L275.89 378.69"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M217.78 378.69L240.81 378.69"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M217.78 396.22L275.89 396.22"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M265.48 413.74L275.89 413.74"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M217.78 413.74L260.24 413.74"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M217.78 431.26L275.89 431.26"
            />
            <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M179.05 346.11L210.71 346.11"
            />
            <path
                d="M288.66 410.43a9.59 9.59 0 01-6.68-2.7l-6.19-6.14a2.24 2.24 0 013.11-3.22l1.22 1.14-6.23-12.81a2.7 2.7 0 01-.08-2.07 2.65 2.65 0 014.87-.2L281 389a2.74 2.74 0 011.66-1 3.6 3.6 0 012.46.71 2.68 2.68 0 011.74-1 3.23 3.23 0 012.08.5 1.75 1.75 0 011.82-1.1 2.51 2.51 0 012 1.32l4.4 8.09a9.6 9.6 0 01-8.55 13.95zm-11.29-11.67h-.16a1.24 1.24 0 00-.72 2.11l6.19 6.13a8.59 8.59 0 0013.64-10.07l-4.38-8.07a1.51 1.51 0 00-1.2-.8c-.41 0-.85.07-1 1l-.15.91-.68-.62a2.75 2.75 0 00-1.9-.69 2 2 0 00-1.35 1l-.32.51-.45-.41a3 3 0 00-2.07-.8 2.16 2.16 0 00-1.45 1.2l-.48.83-3.12-6.16a1.65 1.65 0 00-3 1.41l8.45 17.55-5-4.72a1.21 1.21 0 00-.85-.31z"
                fill="#637381"
            />
            <path
                d="M283.24 395.86a.51.51 0 01-.46-.31l-2.3-5.41a.51.51 0 01.27-.66.5.5 0 01.65.27l2.3 5.41a.5.5 0 01-.26.66.45.45 0 01-.2.04zM287.25 394.67a.5.5 0 01-.46-.3l-2-4.75a.5.5 0 01.26-.66.52.52 0 01.66.27l2 4.75a.49.49 0 01-.27.65.41.41 0 01-.19.04zM291.18 393.63a.48.48 0 01-.45-.29l-1.93-4.15a.49.49 0 01.24-.66.5.5 0 01.67.24l1.93 4.15a.49.49 0 01-.46.71z"
                fill="#637381"
            />
            <path
                transform="rotate(-45 274.004 54.354)"
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M267 47.35H281V61.35H267z"
            />
            <path
                transform="rotate(-45 446.093 163.352)"
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M439.1 156.35H453.1V170.35H439.1z"
            />
            <path
                transform="rotate(-45 143.105 403.354)"
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M136.1 396.35H150.1V410.35H136.1z"
            />
            <path
                transform="rotate(-45 255.596 67.999)"
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M251.78 64.18H259.42V71.82000000000001H251.78z"
            />
            <path
                transform="rotate(-45 250.603 330.997)"
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M246.78 327.18H254.42V334.82H246.78z"
            />
            <circle
                cx={200}
                cy={375}
                r={4}
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx={328}
                cy={331}
                r={4}
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx={439}
                cy={89}
                r={4}
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx={23}
                cy={101.35}
                r={4}
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <g>
                <path
                fill="#637381"
                d="M144.34 78.35L135.59 63.56 55.06 58.26 55.06 73.12 55.06 78.47 55.06 325.74 350.08 306.31 350.08 90.39 144.34 78.35z"
                />
                <path
                fill="#637381"
                d="M348.42 301.82L57.62 320.19 57.62 80.08 348.42 96.12 348.42 301.82z"
                />
                <g clipPath="url(#a)">
                <path
                    opacity={0.17}
                    d="M349.64 303.3L343.85 303.67 343.85 94.1 349.64 94.43 349.64 303.3z"
                />
                <path
                    opacity={0.17}
                    d="M349.64 301.6L343.85 301.96 343.85 220.81 349.64 220.71 349.64 301.6z"
                />
                <path
                    fill="#92e3a9"
                    stroke="#637381"
                    strokeMiterlimit={10}
                    d="M348.75 104.55L56.27 89.83 56.27 76.76 348.75 93.36 348.75 104.55z"
                />
                </g>
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M348.42 301.82L57.62 320.19 57.62 80.08 348.42 96.12 348.42 301.82z"
                />
                <path
                opacity={0.2}
                d="M334 133.64L288.63 131.92 288.58 131.92 240.81 130.11 240.76 130.1 190.4 128.2 190.34 128.19 137.18 126.18 137.12 126.18 80.89 124.05 80.89 142.44 80.89 142.44 80.89 311.03 333.89 297.16 333.89 149.72 334 149.72 334 133.64z"
                />
                <path
                fill="#92e3a9"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M157.66 137.75L100.99 136.19 100.99 117.72 157.66 119.79 157.66 137.75z"
                />
                <path
                fill="#7a7a7a"
                d="M141.53 129.96L117.79 129.22 117.79 125.77 141.53 126.55 141.53 129.96z"
                />
                <path
                fill="#92e3a9"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M211.32 139.22L157.72 137.75 157.72 119.8 211.32 121.75 211.32 139.22z"
                />
                <path
                fill="#92e3a9"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M262.15 140.61L211.38 139.22 211.38 121.75 262.15 123.6 262.15 140.61z"
                />
                <path
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M310.36 141.93L310.36 125.36 262.2 123.61 262.2 140.61 100.99 136.19 100.99 305.45 356.06 291.24 356.06 143.19 310.36 141.93z"
                />
                <path
                fill="#92e3a9"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M356.16 143.19L310.42 141.93 310.42 125.36 356.16 127.03 356.16 143.19z"
                />
                <path
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M348.95 275.65L219.74 281.7 219.74 170.83 348.95 172.26 348.95 275.65z"
                />
                <path
                fill="#92e3a9"
                d="M287.13 172L255.04 171.66 255.04 184.9 287.13 185.02 287.13 172z"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M329.32 200.49L339.18 200.44"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M270.7 200.76L323.32 200.52"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 200.96L264.95 200.79"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M297.08 207.59L339.18 207.24"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M273.24 207.79L290.24 207.65"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 208.18L265.59 207.86"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M252.69 215.09L339.18 214.03"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 215.39L244.21 215.19"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M318.5 221.16L339.18 220.82"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M277.68 221.81L311.21 221.27"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 222.61L270.7 221.92"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M265.59 229.08L339.18 227.62"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 229.82L258.51 229.22"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M329.32 234.35L339.18 234.12"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M270.7 235.72L323.32 234.49"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 236.72L264.95 235.86"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M297.08 242.06L339.18 240.91"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M273.24 242.7L290.24 242.24"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 243.94L265.59 242.91"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M252.69 250.39L339.18 247.71"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 251.15L244.21 250.65"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M318.5 255.22L339.18 254.5"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M277.68 256.64L311.21 255.47"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 258.37L270.7 256.88"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M265.59 264.13L339.18 261.29"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M227.94 265.58L258.51 264.4"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M223.56 185.15L347.84 185.59"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M255.04 171.66L255.04 184.9"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M287.13 172.01L287.13 185.02"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M318.15 172.34L318.15 185.14"
                />
                <path
                fill="#637381"
                d="M281.91 179.71L261.41 179.57 261.41 176.36 281.91 176.53 281.91 179.71z"
                />
                <path
                fill="#ccc"
                d="M248.62 179.49L227.38 179.35 227.38 176.08 248.62 176.26 248.62 179.49z"
                />
                <path
                fill="#ccc"
                d="M313.42 179.92L293.61 179.79 293.61 176.63 313.42 176.8 313.42 179.92z"
                />
                <path
                fill="#ccc"
                d="M342.95 180.12L323.79 179.99 323.79 176.88 342.95 177.04 342.95 180.12z"
                />
                <path
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M210.46 282.13L111.89 286.74 111.89 150.41 210.46 152.43 210.46 282.13z"
                />
                <path
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                d="M210.46 202.03L185.98 186.26 163.77 235.44 141.78 218.09 111.89 286.74 210.46 282.13 210.46 202.03z"
                />
                <path
                d="M149.17 179.49a15 15 0 00-14.82-15 14.8 14.8 0 00-15 14.82 15 15 0 0015 15 14.82 14.82 0 0014.82-14.82z"
                fill="none"
                stroke="#637381"
                strokeMiterlimit={10}
                />
                <path
                fill="#7a7a7a"
                d="M195.64 131.65L173.18 130.95 173.18 127.58 195.64 128.32 195.64 131.65z"
                />
                <path
                fill="#7a7a7a"
                d="M247.21 133.25L225.93 132.59 225.93 129.31 247.21 130.01 247.21 133.25z"
                />
                <path
                fill="#7a7a7a"
                d="M297 134.8L276.83 134.17 276.83 130.99 297 131.65 297 134.8z"
                />
                <path
                fill="#7a7a7a"
                d="M343.38 136.24L324.23 135.64 324.23 132.54 343.38 133.17 343.38 136.24z"
                />
            </g>
            <g>
                <ellipse cx={396.75} cy={458.45} rx={58.25} ry={8.45} fill="#92e3a9" />
                <ellipse
                cx={396.75}
                cy={458.45}
                rx={58.25}
                ry={8.45}
                fill="#fff"
                opacity={0.5}
                />
                <path
                d="M367.15 141s-3.21 11.93-2.53 13.07 2.3.69 1.38 3-3 6.65-2.52 8.48 3 3.21 3 3.21 1.15 8.26 2.29 9.86 7.34.69 7.34.69l.46 6.2 18.35-1.15-.69-11-.92-34z"
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M389.17 131.86c-1.14.17-9.87 0-16.75 1.14s-8.94 1.61-8.71 4.59-.46 4.13 2.06 5.27a10.26 10.26 0 003.44 1.15s-.69 3.21-.92 5.51 3.9 4.81 3.9 4.81-.23 3.44.23 4.59 1.61 1.38 2.3.46 1.14-5.28 1.83-3.44 3.44 15.59 5.28 17.2 10.09.69 12.38.23 6.65-10.09 8.72-15.83 1.14-15.82-1.84-20.41-8.94-5.73-11.92-5.27z"
                fill="#637381"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M374.58 155.82a58.44 58.44 0 01.56 6.44c0 2.52-1.68 3.92-.56 5s2 .56 2.8-1.4a16.54 16.54 0 001.12-7.28c-.28-1.92-.56-6.12-3.92-2.76zM372.19 184.84l-5 9.17s12.61-3.67 19.49-3.67a94.09 94.09 0 0114.45 1.38l-3.21-8.95s-17.47-1.83-25.73 2.07zM419.67 305.79s0 8-.69 11.47-5.27 8.71-7.11 9.63-4.13 1.15-4.59 0-1.14-.69-.45-6.65 3.17-17.43 3.17-17.43z"
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M421.28 298.45l-1.61 7.34a17.92 17.92 0 01-6 .23 4.56 4.56 0 01-3.67-3.21l.69-6.42z"
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M420.15 199.75s3.21 19.49 5.27 33.94 2.51 28.21 2.05 35.09-3.21 29-4.13 30.59-7.11 2.29-9.63 1.14S410 298 410 293.63s2.29-45 2.29-45z"
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M370.6 451.57a5.61 5.61 0 00-2.6.66c-1.36.72-7.26 2.34-11.06 3.69-5.93 2.11-10.56 1-10.08 2.52s9.73 4.66 15.08 4.74 7.93-1.26 10.49-1.21.67 1.29 4.93 1.77 5.65.5 7.14-1.83 2.32-2.93 1.85-5.87V456a5.44 5.44 0 00-5.45-4.46z"
                fill="#637381"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M403.74 448.73a3.91 3.91 0 00-2.24.63c-1.16.73-6.25 2.27-9.51 3.6-5.1 2.07-9.17.69-8.7 2.37s5.94 4 10.6 4.23a38.39 38.39 0 007.56-.28c5-.28 1.83 1.5 3.64 2.24a12.17 12.17 0 003.92.56c5.32.28 6 .7 7.19-1.75s1.92-3.07 1.41-6.26V454c-.47-2.84-2.58-4.92-4.89-5z"
                fill="#637381"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M356.14 282.4s.92 32.11.92 42.89 2.75 59.49 6.42 77.15 5.73 42.89 5.73 45.64-.92 3.44.92 5.28 8.71 5.27 11.24 4.12 3.9-5.5 3.9-5.5 0-23.85.68-39.45-.45-36-.45-36 8.94 41.29 11.46 49.54 4.59 23.24 5.05 26.22 2.48 3.08 5 3.08c3.08 0 6.89-.4 8.26-2.69s-1.6-26.38-1.6-36-7.57-69.36-6.88-84 5-40.13 3.67-47.7a84.43 84.43 0 01-1.38-13.61s-47.21-5.49-52.94 11.03z"
                fill="#5e5e5e"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M369 192.87s-10.26 4.35-15.07 6.65a72.29 72.29 0 01-6.88 3s7.73 73 7.73 76.91-.23 4.13 1.15 5.28 8.49 1.67 21.11 1.44 28.43-2.82 29.58-2.82a5.92 5.92 0 004.58-2.75c1.38-2.06 8.74-79.9 9-80.81s-18.14-7.57-19.75-8-10.83-6.7-31.45 1.1z"
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M405 239.63c-6.56 9.44-16.92 23.17-25 28.37M411.4 230s-1.19 1.91-3.18 4.89M392.41 262.63s-9.08 8.26-16.51 12.39"
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M405.22 412.3a29.87 29.87 0 008.52 6.24v-1.88c0-9.63-7.57-69.36-6.88-84 .12-2.67.37-5.7.68-8.91a11.69 11.69 0 00-.91-1.87 163.08 163.08 0 01-10.09-18.11l11.91 11.39c.1-.86.2-1.73.29-2.59-3.17-5.7-7.34-13.52-7.62-15.91l-14 7.56s-1.83 54.45-1.6 72.34c0 0 1.35 6.25 3.15 14.36 4.33 9.82 12.06 16.73 16.55 21.38z"
                fill="#5e5e5e"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M358.9 286a55.36 55.36 0 003 8.32 9.72 9.72 0 004.13 4.36M373.69 444.62a54.86 54.86 0 01-.12 10.57M372.67 431.48c.21 3 .4 5.74.57 7.93M366.73 312.2c.57 23 1.94 73.48 3.17 84.73.89 8.16 1.71 19.43 2.38 29M365.92 286.35c-.23.69.54 14.39.54 14.39s.05 2.33.15 6.26"
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M318 220.14s.89-1.55 2.21-4.2 1.11-6 1.11-7.73 2-2.43 2-4.42-2.87-1.76-4.41-.44-2 5.3-2 5.3-2.45-4.14-3.75-7.06c-1.18-2.63-2.8-7.16-5-7.82s-2.1 2.07-1.87 2.73a26 26 0 001.36 3.75c.51 1 1.54 4 1.54 4s-3.09-2.43-4.19-2.43a1.62 1.62 0 00-1.33 2.43s-2.65 1.1-2 2.87.89 2.43.89 2.43-.67.88 0 3.09 3.53 6 4.63 7.73a9.59 9.59 0 002.43 2.65z"
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M303.68 204.24a18 18 0 002.45 3M302.58 209.54a10 10 0 001.5 2"
                fill="none"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M311.18 231.63l-3.9-8.49a9.88 9.88 0 016.66-4.13c4.81-.92 5.5 0 5.5 0l2.52 8.72s-8.25.69-10.78 3.9z"
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M334.58 247.22s-7.11-12.15-8.95-16.51-4.35-5.51-8.48-5.05-7.8 4.82-7.8 8 14.68 34.86 15.37 36.7 5.73 2.29 9.17.23 3.9-13.27.69-23.37z"
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M347 202.5s-9.46 27.89-11.06 32.24-9 24.18-11 28.08-.22 10.55 6 11.47 7.11-.92 10.32-5.51 11.13-16.06 11.13-16.06-3.53-44.95-5.39-50.22z"
                fill="#fff"
                stroke="#637381"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
            </g>
        </SvgIcon>
    )
}