import merge from 'lodash.merge';
import Card from './Card';
import Lists from './Lists';
import Paper from './Paper';
import Input from './Input';
import Button from './Button';
import Tooltip from './Tooltip';
import Backdrop from './Backdrop';
import Typography from './Typography';
import IconButton from './IconButton';
import Autocomplete from './Autocomplete';
import TableCell from './TableCell';
import { Theme } from '@mui/material';
import Stack from './Stack';

export default function ComponentsOverrides(theme: Theme) {
  return merge(
    Card(theme),
    Lists(theme),
    Paper(),
    Input(theme),
    Button(theme),
    Tooltip(theme),
    Backdrop(theme),
    Typography(theme),
    IconButton(theme),
    Autocomplete(theme),
    TableCell(theme),
    Stack(theme)
  );
}