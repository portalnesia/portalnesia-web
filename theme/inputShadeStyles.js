import makeStyles from '@mui/styles/makeStyles';
import { yellow } from '@mui/material/colors';

const base=({ palette }) => {
  const color = palette.primary.main;
  const error = palette.secondary.main;
  return {
    root: {
      border:`1px solid ${palette.divider}`,
      transition: '0.3s',
    },
    focused: {
      border:'none',
      boxShadow: `0 0 0 2px ${color}`,
    },
    error: {
      '&$focused': {
        boxShadow: `0 0 0 2px ${error}`,
      },
    },
    disabled: {
      backgroundColor: palette.action.disabledBackground,
    },
    input: {
      padding: '1rem',
    },
  };
};
const shadeInputBaseStyles = theme => {
    return {
      ...base(theme),
      formControl: {
        'label + &': {
          marginTop: theme.spacing(5),
        },
      },
    };
};
const shadeInputLabelStyles = ({ palette,spacing }) => ({
    root: {
        color: palette.text.primary,
        '&$focused:not($error)': {
          color: palette.text.primary,
        },
    },
    error: {},
    focused: {},
    shrink: {
        transform: 'translate(0, 1.5px) scale(0.8)',
        letterSpacing: 1,
    },
});

export const shadeTextFieldStylesHook = {
    useInputBase: makeStyles(shadeInputBaseStyles, {
      name: 'ShadeTextField',
    }),
    useInputLabel: makeStyles(shadeInputLabelStyles, {
      name: 'ShadeTextField',
    }),
};