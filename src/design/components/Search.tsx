import React from 'react'
import { styled, SxProps, Theme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import Popov from '@mui/material/Popover'
import { alpha } from '@mui/system/colorManipulator';
import useResponsive from '@design/hooks/useResponsive';
import Router, { useRouter } from 'next/router';

const Popover = styled(Popov)(() => ({
    '.MuiPaper-root': {
        overflow: 'hidden'
    }
}))

const Wrapper = styled('div', { shouldForwardProp: (prop: string) => !['autoresize', 'sx'].includes(prop) })<{ autoresize?: boolean }>(({ theme, autoresize }) => ({
    position: 'relative',
    borderRadius: 10,
    background: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.15),
    display: 'inline-block',
    '&:hover': {
        background: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.15 : 0.18),
    },
    ...(autoresize ? {
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
    } : {
        width: '100%'
    })
}))

const SearchStyle = styled('div')(({ theme }) => ({
    width: theme.spacing(5),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    right: 0,
    top: 0
}))

const DeleteStyle = styled('div', { shouldForwardProp: prop => prop !== 'focused' })<{ focused?: boolean }>(({ theme, focused }) => ({
    width: theme.spacing(5),
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    display: 'flex',
    right: 0,
    top: 0
}))

const InputStyle = styled('input', {
    shouldForwardProp: prop => !['removed', 'autoresize'].includes(String(prop))
})<{ removed?: boolean, autoresize?: boolean }>(({ theme, removed, autoresize }) => ({
    font: 'inherit',
    padding: `${theme.spacing(1)} ${theme.spacing(5)} ${theme.spacing(1)} ${theme.spacing(1)}`,
    border: 0,
    display: 'block',
    verticalAlign: 'middle',
    whiteSpace: 'normal',
    background: 'none',
    margin: 0, // Reset for Safari
    height: '100%',
    color: 'inherit',
    '&:focus-visible': {
        outline: 'unset'
    },
    ...(autoresize ? {
        transition: theme.transitions.create('width'),
        width: 180,
        '&:focus': {
            width: 350,
        },
    } : { width: '100%', '&:focus': { outline: 0 } }),
    ...(removed ? { padding: `${theme.spacing(1)} ${theme.spacing(5)} ${theme.spacing(1)} ${theme.spacing(1)}` } : {})
}))

export interface SearchProps {
    onsubmit?(value: string): void
    remove?: boolean;
    initialValue?: string;
    autosize?: boolean;
    sx?: SxProps<Theme>;
    wrapperSx?: SxProps<Theme>;
    /**
     * Position if not autosize
     */
    position?: 'left' | 'right'
    autoresize?: boolean
}

export default function Search({ onsubmit, remove = false, initialValue = "", autosize = false, sx, wrapperSx, autoresize = true }: SearchProps) {
    const [value, setValue] = React.useState(initialValue);
    const [open, setOpen] = React.useState(false);
    //const [focus, setFocus] = React.useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, [])

    const handleDivClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e?.currentTarget?.blur();
        setOpen(e => !e)
        setTimeout(() => {
            inputRef.current?.focus()
        }, 100);
    }, [setOpen]);

    const handleRemove = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (e?.stopPropagation) e.stopPropagation();
        setValue("")
        onsubmit?.("");
        if (!autosize || !autoresize) setTimeout(() => inputRef.current?.focus(), 100);
    }, [autosize, autoresize, onsubmit])

    const handleSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        if (e?.preventDefault) e.preventDefault();
        if (e?.stopPropagation) e.stopPropagation();
        if (onsubmit) {
            setOpen(false)
            onsubmit(value);
        }
    }, [onsubmit, value])

    return (
        <>
            {autosize ? (
                <form onSubmit={handleSubmit}>
                    <Wrapper autoresize={autoresize} sx={{ ...wrapperSx }}>
                        <InputStyle ref={inputRef} sx={sx} autoresize={autoresize} removed={remove && value?.length > 0} placeholder={`Search...`} value={value} onChange={handleChange} />
                        {remove && value?.length > 0 ? (
                            <DeleteStyle focused={value?.length > 0}>
                                <IconButton onClick={handleRemove} size="small">
                                    <ClearIcon />
                                </IconButton>
                            </DeleteStyle>
                        ) : (
                            <SearchStyle>
                                <SearchIcon />
                            </SearchStyle>
                        )}
                    </Wrapper>
                </form>
            ) : (
                <div>
                    <IconButton ref={buttonRef} onClick={handleDivClick} disableFocusRipple>
                        <SearchIcon />
                    </IconButton>

                    <Popover
                        open={open}
                        anchorEl={buttonRef.current}
                        onClose={handleDivClick}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left'
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            <Wrapper sx={{ width: `calc(100vw - 30px)`, height: 45, ...wrapperSx }}>
                                <InputStyle ref={inputRef} sx={sx} removed={remove && value?.length > 0} placeholder={`Search...`} value={value} onChange={handleChange} />
                                {remove && value?.length > 0 ? (
                                    <DeleteStyle focused={value?.length > 0}>
                                        <IconButton onClick={handleRemove} sx={{ WebkitTapHighlightColor: 'transparent' }} size="small">
                                            <ClearIcon />
                                        </IconButton>
                                    </DeleteStyle>
                                ) : (
                                    <SearchStyle>
                                        <SearchIcon />
                                    </SearchStyle>
                                )}
                            </Wrapper>
                        </form>
                    </Popover>
                </div>
            )}

        </>
    );
}

export function useSearch(fullWidth?: boolean): SearchProps & { search: string } {
    const router = useRouter();
    const query = router.query?.q;
    const mdDown = useResponsive('down', 'md')

    const searchSubmit = React.useMemo(() => {
        if (typeof query === 'string') {
            return query;
        }
        return "";
    }, [query]);

    const handleSearch = React.useCallback((data: string) => {
        const { asPath } = Router;
        const url = new URL(`${process.env.NEXT_PUBLIC_URL}${asPath}`);
        const quer = url.searchParams;

        if (data.length) {
            quer.set('q', data);
            if (quer.has('page')) quer.set('page', '1');
            const path = `${url.pathname}?${quer.toString()}`
            Router.replace(path, undefined, { shallow: true })
        } else {
            quer.delete('q');
            if (quer.has('page')) quer.set('page', '1');
            const query = quer.toString();
            const path = `${url.pathname}${query.length ? `?${query}` : ''}`
            Router.replace(path, undefined, { shallow: true })
        }
    }, [])

    return {
        search: searchSubmit,
        onsubmit: handleSearch,
        autosize: !mdDown || fullWidth,
        remove: true,
    }
}