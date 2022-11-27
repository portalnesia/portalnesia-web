import { useRef, useState, memo } from 'react';
// material
import { alpha } from '@mui/system/colorManipulator';
// components
import Avatar from '@design/components/Avatar';
import MenuPopover from '@design/components/MenuPopover';
import {useSelector} from '@redux/store'
import { State } from '@type/redux';
import Image from '@comp/Image'
import { accountUrl } from '@utils/main';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButtonActive from '@comp/IconButtonActive';

export default function AccountPopover() {
  const user = useSelector<State['user']>(s=>s.user);
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButtonActive
        ref={anchorRef}
        open={open}
        onClick={handleOpen}
      >
        <Avatar alt="Profiles">
          {user && user?.picture ? (
            <Image src={`${user?.picture}&size=40&watermark=no`} webp alt={user?.name} />
          ) : undefined}
        </Avatar>
      </IconButtonActive>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {user ? user?.name : "Guest"}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user ? `@${user?.username}` : '@portalnesia'}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ p: 2, pt: 1.5 }}>
          {user ? (
            <Button href={accountUrl("logout")} fullWidth color="inherit" variant="outlined">
              Logout
            </Button>
          ) : (
            <>
              <Button href={accountUrl("login")} fullWidth color="inherit" variant="outlined">
                Login / Register
              </Button>
            </>
          )}
          
        </Box>
      </MenuPopover>
    </>
  );
}