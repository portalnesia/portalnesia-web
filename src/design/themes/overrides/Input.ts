import { Theme } from "@mui/material";

export default function Input(theme: Theme) {
    return {
        MuiInputBase: {
            styleOverrides: {
                root: {
                    '&.Mui-disabled': {
                        '& svg': { color: theme.palette.text.disabled }
                    }
                },
                input: {
                    '&::placeholder': {
                        opacity: 1,
                        color: theme.palette.text.disabled
                    },
                    '&:-webkit-autofill, &:-internal-autofill-selected, &:-internal-autofill-previewed': {
                        boxShadow: 'unset !important',
                        WebkitTextFillColor: `${theme.palette.text.primary} !important`,
                        caretColor: `${theme.palette.text.primary} !important`,
                        transition: "background-color 5000000s ease-in-out 0s;"
                    }
                }
            }
        },
        MuiInput: {
            styleOverrides: {
                underline: {
                    '&:before': {
                        borderBottomColor: theme.palette.grey[500_56]
                    }
                }
            }
        },
        MuiFilledInput: {
            styleOverrides: {
                root: {
                    backgroundColor: theme.palette.grey[500_12],
                    '&:hover': {
                        backgroundColor: theme.palette.grey[500_16]
                    },
                    '&.Mui-focused': {
                        backgroundColor: theme.palette.action.focus
                    },
                    '&.Mui-disabled': {
                        backgroundColor: theme.palette.action.disabledBackground
                    }
                },
                underline: {
                    '&:before': {
                        borderBottomColor: theme.palette.grey[500_56]
                    }
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.grey[500_32]
                    },
                    '&.Mui-disabled': {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.action.disabledBackground
                        }
                    }
                }
            }
        }
    };
}