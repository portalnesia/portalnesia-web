import CircularProgress from "@mui/material/CircularProgress";

function SvgLogo() {
  return (
    <svg width="100px" height="100px" viewBox="0 0 655.000000 665.000000"
    preserveAspectRatio="xMidYMid meet">
      <g transform="translate(0.000000,665.000000) scale(0.100000,-0.100000)"
      fill="#ffffff" stroke="none">
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
    </svg>
  )
}

export default function SplashScreen() {
    return (
      <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div style={{position:'fixed',top:'35%',left:'50%',transform:'translate(-50%,-50%)'}}>
          <SvgLogo />
        </div>
        <CircularProgress size={60} sx={{color:'white',position:'fixed',top:'60%',left:'calc(50% - 30px)'}} />
      </div>
    )
}