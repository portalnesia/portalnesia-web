import { useCallback,useRef,useState } from 'react';
// material
import { alpha } from '@mui/system/colorManipulator';
// components
import MenuPopover from '@design/components/MenuPopover';
import Iconify from '@design/components/Iconify';
import useDarkTheme from '@design/hooks/useDarkTheme'
import {State} from '@type/redux'
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import IconButtonActive from '@comp/IconButtonActive';

const Theme = [
  {
    value: 'auto',
    label: "Device Theme",
  },
  {
    value: 'light',
    label: "Light Theme"
  },
  {
    value: 'dark',
    label: "Dark Theme",
  }
];

export default function ThemePopover() {
  const {theme,setTheme} = useDarkTheme();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  },[]);

  const handleClose = useCallback((value?: State['theme']) => () => {
    if(value) {
      setTheme(value)
    }
    setOpen(false);
  },[setTheme]);

  return (
    <>
      <Tooltip title={"Theme"}>
        <IconButtonActive
          ref={anchorRef}
          open={open}
          onClick={handleOpen}
        >
          <Iconify icon={'mdi:theme-light-dark'} height={20} width={28} />
        </IconButtonActive>
      </Tooltip>
      
      <MenuPopover open={open} onClose={handleClose()} anchorEl={anchorRef.current} disableScrollLock>
        <Box sx={{ py: 1 }}>
          {Theme.map((t)=>(
            <MenuItem
              key={t.value}
              selected={t.value === theme}
              onClick={handleClose(t.value as State['theme'])}
              sx={{ py: 1, px: 2.5 }}
            >
              <ListItemText primaryTypographyProps={{ variant: 'body2' }}>
                {t.label}
              </ListItemText>
            </MenuItem>
          ))}
        </Box>
      </MenuPopover>
    </>
  )
}